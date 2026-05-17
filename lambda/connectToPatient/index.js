import jwt from "jsonwebtoken";
import {
  getPatientByConnectionCode, getCaregiver,
  updatePatientField, updateCaregiverField,
} from "../shared/dynamodb.js";

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

  const { caregiverId, code } = body;
  if (!caregiverId || !code) return respond(400, { error: "caregiverId and code are required" });

  try {
    const [patient, caregiver] = await Promise.all([
      getPatientByConnectionCode(code.trim()),
      getCaregiver(caregiverId),
    ]);

    if (!patient) return respond(404, { error: "Code not found. Ask your patient to generate a new one." });
    if (!caregiver) return respond(404, { error: "Caregiver account not found" });

    if (!patient.connectionCodeExpiresAt || new Date(patient.connectionCodeExpiresAt) < new Date()) {
      return respond(410, { error: "Code has expired. Ask your patient to generate a new one." });
    }

    // Link both records and clear the one-time code
    await Promise.all([
      updateCaregiverField(caregiverId, "linkedPatientId", patient.patientId),
      updatePatientField(patient.patientId, "caregiverId", caregiverId),
      updatePatientField(patient.patientId, "connectionCode", null),
      updatePatientField(patient.patientId, "connectionCodeExpiresAt", null),
    ]);

    const token = jwt.sign(
      { sub: caregiverId, role: "caregiver", caregiverId, patientId: patient.patientId },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return respond(200, {
      token,
      patientId: patient.patientId,
      patientName: patient.name,
    });
  } catch (err) {
    console.error("connectToPatient error:", err);
    return respond(500, { error: err.message });
  }
};
