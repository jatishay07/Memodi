import { v4 as uuidv4 } from "uuid";
import {
  getCaregiverByEmail, putCaregiver,
  getPatientByConnectionCode, updatePatientField,
} from "../shared/dynamodb.js";
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

  const { email, password, name, relationship, connectionCode } = body;
  if (!email || !password || !name || !relationship) {
    return respond(400, { error: "email, password, name, and relationship are required" });
  }
  if (!connectionCode || !connectionCode.trim()) {
    return respond(400, { error: "A patient connection code is required to create a caregiver account." });
  }

  // Validate the connection code before creating any accounts
  const patient = await getPatientByConnectionCode(connectionCode.trim());
  if (!patient) {
    return respond(404, { error: "Connection code not found. Ask your patient to generate a new code from the Memodi app." });
  }
  if (!patient.connectionCodeExpiresAt || new Date(patient.connectionCodeExpiresAt) < new Date()) {
    return respond(410, { error: "Connection code has expired. Ask your patient to generate a new one." });
  }
  if (patient.caregiverId) {
    return respond(409, { error: "This patient already has a caregiver connected." });
  }

  // Create the Cognito user
  try {
    await signUpUser(email, password, name);
  } catch (err) {
    if (err.name === "UsernameExistsException") {
      try {
        await resendCode(email);
        return respond(200, { needsVerification: true, email, message: "Verification code resent. Check your email." });
      } catch {
        return respond(409, { error: "Email already registered. Please sign in instead." });
      }
    }
    if (err.name === "InvalidPasswordException") return respond(400, { error: "Password must be at least 8 characters" });
    return respond(500, { error: "Registration failed. Please try again." });
  }

  const existing = await getCaregiverByEmail(email);
  const caregiverId = existing?.caregiverId || `caregiver-${uuidv4()}`;

  // Create caregiver record already linked to the patient
  await putCaregiver({
    caregiverId,
    email,
    name,
    relationship,
    linkedPatientId: patient.patientId,
    createdAt: new Date().toISOString(),
  });

  // Link patient → caregiver and consume the code so it can't be reused
  await Promise.all([
    updatePatientField(patient.patientId, "caregiverId", caregiverId),
    updatePatientField(patient.patientId, "connectionCode", null),
    updatePatientField(patient.patientId, "connectionCodeExpiresAt", null),
  ]);

  return respond(201, {
    message: "Account created! Check your email to verify, then sign in.",
    caregiverId,
    email,
    patientName: patient.name,
    needsVerification: true,
  });
};
