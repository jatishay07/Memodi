import { v4 as uuidv4 } from "uuid";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { getPatient, saveInteraction, saveAlert, appendToPatientList, getInteractionsByPatient } from "../shared/dynamodb.js";
import { invokeAgent, extractWithAI } from "../shared/bedrock.js";

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
    const peopleStr = people
      .filter(p => p.name || p.relationship)
      .map(p => [p.name, p.relationship, p.notes].filter(Boolean).join(" — "))
      .join("; ");
    if (peopleStr) lines.push(`People ${nickname} knows: ${peopleStr}`);
  }
  if (history.length) {
    lines.push(`Things ${nickname} has shared: ${history.slice(-20).join("; ")}`);
  }
  if (objects.length) {
    lines.push(`Familiar objects: ${objects.map(o => o.name || o).join(", ")}`);
  }
  if (events.length) {
    lines.push(`Upcoming events: ${events.map(e => e.title || e).join(", ")}`);
  }
  return lines.length ? lines.join("\n") : null;
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
    // Fetch patient + recent conversation history in parallel
    const [patient, recentInteractions] = await Promise.all([
      getPatient(patientId),
      getInteractionsByPatient(patientId, 10),
    ]);
    if (!patient) return respond(404, { error: "Patient not found" });

    const nickname = patient.nickname || patient.name?.split(" ")[0] || patient.name;
    const age = patient.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : "";
    const avoidTopics = patient.preferences?.avoidTopics?.join(", ") ?? "";
    const memorySummary = buildMemorySummary(patient, nickname);

    // Recent conversation history (most recent first → reverse to chronological)
    const history = recentInteractions
      .slice(0, 8)
      .reverse()
      .map(i => `${nickname}: "${i.patientSaid}" → Memodi: "${i.memodiResponded}"`)
      .join("\n");

    const agentInput = `You are Memodi, talking with ${nickname}${age ? `, age ${age}` : ""}.

${memorySummary || `No memory profile yet for ${nickname}.`}

${history ? `Recent conversations:\n${history}` : ""}
${avoidTopics ? `\nNever bring up: ${avoidTopics}.` : ""}

${nickname} just said: "${text}"

Respond in 1-3 warm, short sentences. Be specific to what they said. Reference their memories and past conversations when relevant. Do NOT use generic phrases like "you are loved", "everything is okay", or "you are safe".`;

    const extractionPrompt = `Extract memorable facts from what ${nickname} said. Return JSON only:
{
  "people": [{"name": "string or null", "relationship": "string or null"}],
  "facts": ["short fact about their life, preferences, or experiences"]
}
Only include entries where something was clearly stated. Empty arrays if nothing to extract.
${nickname} said: "${text}"`;

    const [responseText, extracted] = await Promise.all([
      invokeAgent(patientId, agentInput),
      extractWithAI(extractionPrompt),
    ]);

    const memoryUpdates = [];
    if (extracted?.people?.length) {
      for (const person of extracted.people) {
        if (!person.name && !person.relationship) continue;
        const alreadyKnown = (patient.familyMembers ?? []).some(
          p => p.relationship === person.relationship && (!person.name || p.name === person.name)
        );
        if (!alreadyKnown) {
          memoryUpdates.push(appendToPatientList(patientId, "familyMembers", {
            ...person,
            source: "conversation",
            addedAt: new Date().toISOString(),
          }));
        }
      }
    }
    if (extracted?.facts?.length) {
      for (const fact of extracted.facts) {
        const alreadyKnown = (patient.lifeHistory ?? []).some(h => h === fact);
        if (!alreadyKnown) {
          memoryUpdates.push(appendToPatientList(patientId, "lifeHistory", fact));
        }
      }
    }
    if (memoryUpdates.length) await Promise.all(memoryUpdates);

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
