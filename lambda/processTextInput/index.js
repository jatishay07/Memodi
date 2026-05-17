import { v4 as uuidv4 } from "uuid";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { getPatient, saveInteraction, saveAlert } from "../shared/dynamodb.js";
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
    const comfortPhrases = patient.preferences?.comfortPhrases?.join(", ") ?? "";
    const avoidTopics = patient.preferences?.avoidTopics?.join(", ") ?? "";

    const agentInput = `Patient name: ${patient.name}${age ? `, age ${age}` : ""}. Nickname: ${nickname}.
Comfort phrases to use naturally: ${comfortPhrases || "none"}.
Topics to never discuss: ${avoidTopics || "none"}.
Patient memory profile: ${JSON.stringify(patient.memoryBank ?? {})}
The patient just said: "${text}"
Respond as Memodi in 1-3 warm, short sentences using only information from their profile. Never make up facts.`;

    const responseText = await invokeAgent(patientId, agentInput);
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
