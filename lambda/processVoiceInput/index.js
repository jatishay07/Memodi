import { v4 as uuidv4 } from "uuid";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { getPatient, saveInteraction, saveAlert } from "../shared/dynamodb.js";
import { invokeClaude, extractJSON } from "../shared/bedrock.js";
import { synthesizeSpeech } from "../shared/polly.js";
import { transcribeAudio } from "../shared/transcribe.js";

const snsClient = new SNSClient({ region: process.env.AWS_REGION || "us-east-1" });

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "POST,OPTIONS"
};

function respond(statusCode, body) {
  return { statusCode, headers: CORS_HEADERS, body: JSON.stringify(body) };
}

async function queryMemoryBank(patient, query) {
  const systemPrompt = `You are a memory context analyzer for a dementia patient companion app called Memodi.
Given the patient's complete memory profile and what they just said, find the most relevant context to help craft a warm, accurate response.
Return ONLY a valid JSON object with exactly this shape (no explanation, no markdown):
{
  "relevantPeople": [],
  "relevantObjects": [],
  "relevantHistory": [],
  "relevantRoutine": null,
  "queryType": "person_inquiry"
}
queryType must be one of: person_inquiry, object_location, routine, general_comfort, distress`;

  const raw = await invokeClaude(systemPrompt, `Patient profile: ${JSON.stringify(patient)}\n\nPatient said: "${query}"\n\nReturn the relevant context JSON.`, 1024);
  const parsed = extractJSON(raw);
  return parsed ?? { relevantPeople: [], relevantObjects: [], relevantHistory: [], relevantRoutine: null, queryType: "general_comfort" };
}

async function generateResponse(patientSaid, memoryContext, patient) {
  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
  const comfortPhrases = patient.preferences?.comfortPhrases?.join(", ") ?? "";
  const avoidTopics = patient.preferences?.avoidTopics?.join(", ") ?? "";

  const systemPrompt = `You are Memodi, a warm, gentle voice companion for ${patient.name}, age ${age}.
Rules:
- Respond in 1-3 short, warm, clear sentences ONLY
- NEVER make up information — only use what is in the memory context provided
- Use their name: ${patient.nickname || patient.name}
- Comfort phrases you may use naturally: ${comfortPhrases}
- Never discuss these topics: ${avoidTopics}
- Never argue, correct, or express frustration
- If the memory context includes a deceased person's deceasedMessage, quote it gently
- If you don't know something, redirect warmly: "I'm not sure, but I know ${patient.nickname || patient.name.split(" ")[0]} is loved and safe."`;

  return await invokeClaude(systemPrompt, `Memory context: ${JSON.stringify(memoryContext)}\n\n${patient.nickname || patient.name} just said: "${patientSaid}"\n\nRespond as Memodi in 1-3 warm, short sentences.`, 256);
}

const DISTRESS_KEYWORDS = ["scared", "afraid", "confused", "lost", "help", "where am i", "who are you", "i don't know", "i don't remember", "leave me alone", "go away", "something is wrong", "i can't"];

async function detectDistress(patientSaid) {
  const lower = patientSaid.toLowerCase();
  const keywordMatch = DISTRESS_KEYWORDS.some(kw => lower.includes(kw));

  const raw = await invokeClaude(
    `You are a distress detection system for a dementia patient monitoring app. Analyze the text and return ONLY a JSON object (no explanation): { "isDistressed": boolean, "severity": "low", "reason": "brief reason" } severity must be "low", "medium", or "high".`,
    `Patient said: "${patientSaid}"`,
    128
  );
  const aiResult = extractJSON(raw) ?? { isDistressed: false, severity: "low", reason: "" };

  return {
    isDistressed: keywordMatch || aiResult.isDistressed,
    severity: aiResult.severity || (keywordMatch ? "medium" : "low"),
    reason: aiResult.reason || (keywordMatch ? "Distress keyword detected" : "")
  };
}

export const handler = async (event) => {
  if (event.requestContext?.http?.method === "OPTIONS") {
    return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  }

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch { return respond(400, { error: "Invalid JSON body" }); }

  const { patientId, audioBase64, clientTts } = body;
  if (!patientId || !audioBase64) return respond(400, { error: "patientId and audioBase64 are required" });
  const useClientTts = clientTts === true;

  try {
    const patient = await getPatient(patientId);
    if (!patient) return respond(404, { error: "Patient not found" });

    const jobName = `memodi-${patientId.slice(-8)}-${Date.now()}`;
    const transcribedText = await transcribeAudio(audioBase64, jobName);

    const memoryContext = await queryMemoryBank(patient, transcribedText);
    const responseText = await generateResponse(transcribedText, memoryContext, patient);

    const distressResult = await detectDistress(transcribedText);
    const audioResponse = useClientTts ? null : await synthesizeSpeech(responseText);

    if (distressResult.isDistressed) {
      const alertId = uuidv4();
      const alert = {
        alertId, patientId,
        caregiverId: patient.caregiverId,
        timestamp: new Date().toISOString(),
        trigger: distressResult.reason,
        patientSaid: transcribedText,
        resolved: false, resolvedAt: null
      };

      await Promise.all([
        saveAlert(alert),
        snsClient.send(new PublishCommand({
          TopicArn: process.env.SNS_CAREGIVER_TOPIC_ARN,
          Subject: `Memodi Alert: ${patient.name} may need support`,
          Message: JSON.stringify({ alert, patientName: patient.name, severity: distressResult.severity, memodiResponse: responseText })
        }))
      ]);
    }

    await saveInteraction({
      interactionId: uuidv4(), patientId,
      timestamp: new Date().toISOString(),
      type: distressResult.isDistressed ? "distress" : "reactive",
      patientSaid: transcribedText,
      memodiResponded: responseText,
      distressDetected: distressResult.isDistressed
    });

    return respond(200, {
      transcribedText,
      response: responseText,
      audioResponse,
      isDistressed: distressResult.isDistressed,
      distressSeverity: distressResult.severity
    });
  } catch (err) {
    console.error("processVoiceInput error:", err);
    return respond(500, { error: err.message });
  }
};
