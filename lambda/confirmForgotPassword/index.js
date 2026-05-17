import { confirmForgotPassword } from "../shared/cognito.js";

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

  const { email, code, newPassword } = body;
  if (!email || !code || !newPassword) {
    return respond(400, { error: "email, code, and newPassword are required" });
  }
  if (newPassword.length < 8) {
    return respond(400, { error: "Password must be at least 8 characters" });
  }

  try {
    await confirmForgotPassword(email.trim().toLowerCase(), code.trim(), newPassword);
    return respond(200, { message: "Password updated successfully." });
  } catch (err) {
    if (err.name === "CodeMismatchException" || err.name === "ExpiredCodeException") {
      return respond(400, { error: "Invalid or expired code. Please request a new one." });
    }
    if (err.name === "InvalidPasswordException") {
      return respond(400, { error: "Password must be at least 8 characters." });
    }
    return respond(500, { error: "Failed to reset password. Please try again." });
  }
};
