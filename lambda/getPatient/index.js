import { getPatient } from "../shared/dynamodb.js";

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

  const patient = await getPatient(patientId);
  if (!patient) return respond(404, { error: "Patient not found" });

  // Strip auth fields before returning
  const { hashedPassword, connectionCode, connectionCodeExpiresAt, ...safePatient } = patient;
  return respond(200, safePatient);
};
