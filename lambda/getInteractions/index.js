import { getInteractionsByPatient } from "../shared/dynamodb.js";

const CORS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,OPTIONS"
};

function respond(status, body) {
  return { statusCode: status, headers: CORS, body: JSON.stringify(body) };
}

export const handler = async (event) => {
  if (event.requestContext?.http?.method === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }
  const patientId = event.pathParameters?.patientId;
  if (!patientId) return respond(400, { error: "patientId required" });

  const limit = parseInt(event.queryStringParameters?.limit ?? "50", 10);
  const interactions = await getInteractionsByPatient(patientId, limit);
  return respond(200, interactions);
};
