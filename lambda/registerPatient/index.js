import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { getPatientByEmail, putPatient } from "../shared/dynamodb.js";

const CORS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "POST,OPTIONS"
};

function respond(status, body) {
  return { statusCode: status, headers: CORS, body: JSON.stringify(body) };
}

function generateConnectionCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export const handler = async (event) => {
  if (event.requestContext?.http?.method === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch { return respond(400, { error: "Invalid JSON" }); }

  const { email, password, name, dateOfBirth, timezone } = body;
  if (!email || !password || !name) {
    return respond(400, { error: "email, password, and name are required" });
  }

  const existing = await getPatientByEmail(email);
  if (existing) return respond(409, { error: "Email already registered" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const patientId = `patient-${uuidv4()}`;
  const connectionCode = generateConnectionCode();

  const patient = {
    patientId,
    email,
    hashedPassword,
    connectionCode,
    name,
    nickname: name.split(" ")[0],
    dateOfBirth: dateOfBirth || "",
    timezone: timezone || "America/New_York",
    caregiverId: null,
    familyMembers: [],
    objects: [],
    lifeHistory: [],
    medications: [],
    upcomingEvents: [],
    preferences: { comfortPhrases: ["You are loved", "Everything is okay", "You are safe"], avoidTopics: [] },
    routine: { schedule: [] },
    createdAt: new Date().toISOString()
  };

  await putPatient(patient);

  const token = jwt.sign(
    { sub: patientId, role: "patient", patientId },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  return respond(201, { token, connectionCode, patientId, role: "patient", name: patient.name });
};
