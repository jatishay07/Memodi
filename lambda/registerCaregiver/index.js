import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { getCaregiverByEmail, putCaregiver } from "../shared/dynamodb.js";

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

  const { email, password, name, relationship } = body;
  if (!email || !password || !name || !relationship) {
    return respond(400, { error: "email, password, name, and relationship are required" });
  }

  const existing = await getCaregiverByEmail(email);
  if (existing) return respond(409, { error: "Email already registered" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const caregiverId = `caregiver-${uuidv4()}`;

  await putCaregiver({
    caregiverId,
    email,
    hashedPassword,
    name,
    relationship,
    linkedPatientId: null,
    createdAt: new Date().toISOString()
  });

  const token = jwt.sign(
    { sub: caregiverId, role: "caregiver", caregiverId, patientId: null },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  return respond(201, {
    token,
    caregiverId,
    patientId: null,
    role: "caregiver",
    name
  });
};
