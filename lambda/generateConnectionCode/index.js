import { getPatient, updatePatientField } from "../shared/dynamodb.js";

const CORS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

function respond(status, body) {
  return { statusCode: status, headers: CORS, body: JSON.stringify(body) };
}

export const handler = async (event) => {
  if (event.requestContext?.http?.method === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch { return respond(400, { error: "Invalid JSON" }); }

  const { patientId } = body;
  if (!patientId) return respond(400, { error: "patientId is required" });

  try {
    const patient = await getPatient(patientId);
    if (!patient) return respond(404, { error: "Patient not found" });

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await Promise.all([
      updatePatientField(patientId, "connectionCode", code),
      updatePatientField(patientId, "connectionCodeExpiresAt", expiresAt),
    ]);

    return respond(200, { code, expiresAt });
  } catch (err) {
    console.error("generateConnectionCode error:", err);
    return respond(500, { error: err.message });
  }
};
