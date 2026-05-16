import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getPatientByEmail } from "../shared/dynamodb.js";

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

  const { email, password } = body;
  if (!email || !password) return respond(400, { error: "email and password are required" });

  const patient = await getPatientByEmail(email);
  if (!patient) return respond(401, { error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, patient.hashedPassword);
  if (!valid) return respond(401, { error: "Invalid credentials" });

  const token = jwt.sign(
    { sub: patient.patientId, role: "patient", patientId: patient.patientId },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  return respond(200, { token, patientId: patient.patientId, role: "patient", name: patient.name });
};
