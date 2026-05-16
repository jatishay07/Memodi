import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { getCaregiverByEmail, putCaregiver, getPatientByConnectionCode, updatePatientField } from "../shared/dynamodb.js";

const CORS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "POST,OPTIONS"
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

  const { email, password, connectionCode } = body;
  if (!email || !password || !connectionCode) {
    return respond(400, { error: "email, password, and connectionCode are required" });
  }

  const existing = await getCaregiverByEmail(email);
  if (existing) return respond(409, { error: "Email already registered" });

  const patient = await getPatientByConnectionCode(connectionCode.trim().toUpperCase());
  if (!patient) return respond(404, { error: "Invalid connection code" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const caregiverId = `caregiver-${uuidv4()}`;

  await putCaregiver({
    caregiverId,
    email,
    hashedPassword,
    linkedPatientId: patient.patientId,
    createdAt: new Date().toISOString()
  });

  await updatePatientField(patient.patientId, "caregiverId", caregiverId);

  const token = jwt.sign(
    { sub: caregiverId, role: "caregiver", caregiverId, patientId: patient.patientId },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  return respond(201, {
    token,
    caregiverId,
    patientId: patient.patientId,
    patientName: patient.name,
    role: "caregiver"
  });
};
