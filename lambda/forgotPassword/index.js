import { forgotPassword } from "../shared/cognito.js";

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

  const { email } = body;
  if (!email) return respond(400, { error: "email is required" });

  try {
    await forgotPassword(email.trim().toLowerCase());
    return respond(200, { message: "Reset code sent to your email." });
  } catch (err) {
    if (err.name === "UserNotFoundException") {
      // Don't reveal whether the account exists
      return respond(200, { message: "Reset code sent to your email." });
    }
    if (err.name === "LimitExceededException") {
      return respond(429, { error: "Too many attempts. Please wait before trying again." });
    }
    return respond(500, { error: "Failed to send reset code. Please try again." });
  }
};
