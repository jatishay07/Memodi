import { v4 as uuidv4 } from "uuid";
import { getPatientByEmail, putPatient } from "../shared/dynamodb.js";
import { signUpUser, resendCode } from "../shared/cognito.js";

const CODE_TTL_MS = 15 * 60 * 1000;

const CORS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
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

  const { email, password, name } = body;
  if (!email || !password || !name) {
    return respond(400, { error: "email, password, and name are required" });
  }

  try {
    await signUpUser(email, password, name);
  } catch (err) {
    if (err.name === "UsernameExistsException") {
      // If unconfirmed, resend code so they can still verify
      try {
        await resendCode(email);
        return respond(200, { needsVerification: true, email, message: "Verification code resent." });
      } catch {
        return respond(409, { error: "Email already registered" });
      }
    }
    if (err.name === "InvalidPasswordException") return respond(400, { error: "Password must be at least 8 characters" });
    return respond(500, { error: "Registration failed. Please try again." });
  }

  // Reuse existing DynamoDB record if present (e.g. after a Cognito-only deletion), otherwise create new
  const existing = await getPatientByEmail(email);
  const patientId = existing?.patientId || `patient-${uuidv4()}`;
  const connectionCode = existing?.connectionCode || generateConnectionCode();
  const connectionCodeExpiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString();

  await putPatient({
    patientId,
    email,
    connectionCode,
    connectionCodeExpiresAt,
    name,
    nickname: name.split(" ")[0],
    caregiverId: null,
    familyMembers: [],
    objects: [],
    lifeHistory: [],
    medications: [],
    upcomingEvents: [],
    preferences: { comfortPhrases: ["You are loved", "Everything is okay", "You are safe"], avoidTopics: [] },
    routine: { schedule: [] },
    createdAt: new Date().toISOString(),
  });

  return respond(201, {
    message: "Verification email sent. Please check your inbox.",
    patientId,
    connectionCode,
    email,
    name,
    needsVerification: true,
  });
};
