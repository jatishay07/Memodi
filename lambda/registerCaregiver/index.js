import { v4 as uuidv4 } from "uuid";
import { getCaregiverByEmail, putCaregiver } from "../shared/dynamodb.js";
import { signUpUser, resendCode } from "../shared/cognito.js";

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

  const { email, password, name, relationship } = body;
  if (!email || !password || !name || !relationship) {
    return respond(400, { error: "email, password, name, and relationship are required" });
  }

  try {
    await signUpUser(email, password, name);
  } catch (err) {
    if (err.name === "UsernameExistsException") {
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

  const existing = await getCaregiverByEmail(email);
  const caregiverId = existing?.caregiverId || `caregiver-${uuidv4()}`;

  await putCaregiver({
    caregiverId,
    email,
    name,
    relationship,
    linkedPatientId: null,
    createdAt: new Date().toISOString(),
  });

  return respond(201, {
    message: "Verification email sent. Please check your inbox.",
    caregiverId,
    email,
    name,
  });
};
