import { v4 as uuidv4 } from "uuid";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { getPatient, saveInteraction, saveAlert, appendToPatientList } from "../shared/dynamodb.js";
import { invokeAgent } from "../shared/bedrock.js";

const snsClient = new SNSClient({ region: process.env.AWS_REGION || "us-east-1" });

const CORS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

function respond(status, body) {
  return { statusCode: status, headers: CORS, body: JSON.stringify(body) };
}

const DISTRESS_KEYWORDS = ["scared", "afraid", "confused", "lost", "help", "where am i", "who are you", "i don't know", "i don't remember", "leave me alone", "go away", "something is wrong", "i can't"];

function detectDistress(patientSaid) {
  const lower = patientSaid.toLowerCase();
  const isDistressed = DISTRESS_KEYWORDS.some(kw => lower.includes(kw));
  return {
    isDistressed,
    severity: isDistressed ? "medium" : "low",
    reason: isDistressed ? "Distress keyword detected" : "",
  };
}

function buildMemorySummary(patient, nickname) {
  const people = patient.familyMembers ?? [];
  const history = patient.lifeHistory ?? [];
  const objects = patient.objects ?? [];
  const events = patient.upcomingEvents ?? [];

  const lines = [];
  if (people.length) {
    lines.push(`People ${nickname} knows: ${people.map(p => `${p.name} (${p.relationship}${p.notes ? ", " + p.notes : ""})`).join("; ")}`);
  }
  if (history.length) {
    lines.push(`Life memories: ${history.slice(-15).join("; ")}`);
  }
  if (objects.length) {
    lines.push(`Familiar objects: ${objects.map(o => o.name || o).join(", ")}`);
  }
  if (events.length) {
    lines.push(`Upcoming events: ${events.map(e => e.title || e).join(", ")}`);
  }
  return lines.length ? lines.join("\n") : null;
}

// Extract memorable facts from what the patient said (fast, no extra API call)
function quickExtractMemories(text) {
  const relationships = ["daughter", "son", "wife", "husband", "sister", "brother", "mother", "father", "friend", "grandson", "granddaughter", "grandchild", "niece", "nephew", "nurse", "doctor"];
  const people = [];
  const facts = [];

  for (const rel of relationships) {
    const nameMatch = text.match(new RegExp(`my ${rel}[,\\s]+(?:(?:is|was)\\s+)?([A-Z][a-z]+)`, "i"));
    if (nameMatch) {
      people.push({ name: nameMatch[1], relationship: rel, source: "conversation", addedAt: new Date().toISOString() });
    } else if (new RegExp(`my ${rel}`, "i").test(text)) {
      people.push({ relationship: rel, source: "conversation", addedAt: new Date().toISOString() });
    }
  }

  const factPatterns = [
    /i (?:used to|used to love|love|like|enjoy|miss|remember|hate) [^.!?\n]{5,80}/gi,
    /i (?:worked as|was a|am a|was an|am an) [^.!?\n]{3,60}/gi,
    /i (?:lived in|grew up in|was born in|went to) [^.!?\n]{3,60}/gi,
  ];
  for (const pattern of factPatterns) {
    for (const m of [...text.matchAll(pattern)]) {
      facts.push(m[0].trim());
    }
  }

  return { people, facts };
}

export const handler = async (event) => {
  if (event.requestContext?.http?.method === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch { return respond(400, { error: "Invalid JSON" }); }

  const { patientId, text } = body;
  if (!patientId || !text) return respond(400, { error: "patientId and text are required" });

  try {
    const patient = await getPatient(patientId);
    if (!patient) return respond(404, { error: "Patient not found" });

    const nickname = patient.nickname || patient.name?.split(" ")[0] || patient.name;
    const age = patient.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : "";
    const avoidTopics = patient.preferences?.avoidTopics?.join(", ") ?? "";
    const memorySummary = buildMemorySummary(patient, nickname);

    const agentInput = `You are talking with ${nickname}${age ? `, age ${age}` : ""}.
${memorySummary ? memorySummary : `No specific memories on file yet for ${nickname}.`}
${avoidTopics ? `Never bring up: ${avoidTopics}.` : ""}

${nickname} just said: "${text}"

Respond directly and specifically to what they said in 1-3 warm, short sentences. Address them by name. Reference the people and memories above when relevant. Do NOT say generic phrases like "you are loved", "everything is okay", or "you are safe".`;

    // Extract and save new memories from this conversation (inline, fast)
    const { people, facts } = quickExtractMemories(text);
    const memoryUpdates = [];

    for (const person of people) {
      const alreadyKnown = (patient.familyMembers ?? []).some(
        p => p.name === person.name && p.relationship === person.relationship
      );
      if (!alreadyKnown) {
        memoryUpdates.push(appendToPatientList(patientId, "familyMembers", person));
      }
    }
    for (const fact of facts) {
      const alreadyKnown = (patient.lifeHistory ?? []).includes(fact);
      if (!alreadyKnown) {
        memoryUpdates.push(appendToPatientList(patientId, "lifeHistory", fact));
      }
    }

    // Run agent + memory saves in parallel
    const [responseText] = await Promise.all([
      invokeAgent(patientId, agentInput),
      ...memoryUpdates,
    ]);

    const distressResult = detectDistress(text);

    if (distressResult.isDistressed) {
      const alertId = uuidv4();
      const alert = {
        alertId, patientId,
        caregiverId: patient.caregiverId,
        timestamp: new Date().toISOString(),
        trigger: distressResult.reason,
        patientSaid: text,
        resolved: false, resolvedAt: null,
      };
      await Promise.all([
        saveAlert(alert),
        snsClient.send(new PublishCommand({
          TopicArn: process.env.SNS_CAREGIVER_TOPIC_ARN,
          Subject: `Memodi Alert: ${patient.name} may need support`,
          Message: JSON.stringify({ alert, patientName: patient.name, severity: distressResult.severity, memodiResponse: responseText }),
        })),
      ]);
    }

    await saveInteraction({
      interactionId: uuidv4(), patientId,
      timestamp: new Date().toISOString(),
      type: distressResult.isDistressed ? "distress" : "reactive",
      patientSaid: text,
      memodiResponded: responseText,
      distressDetected: distressResult.isDistressed,
    });

    return respond(200, { response: responseText, isDistressed: distressResult.isDistressed, distressSeverity: distressResult.severity });
  } catch (err) {
    console.error("processTextInput error:", err);
    return respond(500, { error: err.message });
  }
};
