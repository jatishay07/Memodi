import jwt from "jsonwebtoken";
import { getCaregiverByEmail } from "../shared/dynamodb.js";
import { authenticateUser } from "../shared/cognito.js";

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

  const { email, password } = body;
  if (!email || !password) return respond(400, { error: "email and password are required" });

  try {
    await authenticateUser(email, password);
  } catch (err) {
    if (err.name === "UserNotConfirmedException") {
      return respond(403, { error: "Please verify your email before signing in.", code: "EMAIL_NOT_VERIFIED" });
    }
    if (err.name === "NotAuthorizedException" || err.name === "UserNotFoundException") {
      return respond(401, { error: "Invalid email or password" });
    }
    return respond(500, { error: "Login failed. Please try again." });
  }

  const caregiver = await getCaregiverByEmail(email);
  if (!caregiver) return respond(404, { error: "Account not found" });

  const token = jwt.sign(
    { sub: caregiver.caregiverId, role: "caregiver", caregiverId: caregiver.caregiverId, patientId: caregiver.linkedPatientId ?? null },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  return respond(200, {
    token,
    caregiverId: caregiver.caregiverId,
    patientId: caregiver.linkedPatientId ?? null,
    role: "caregiver",
    name: caregiver.name ?? "",
  });
};
