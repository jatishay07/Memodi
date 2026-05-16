import { confirmUser, resendCode } from "../shared/cognito.js";

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

  const { email, code, resend } = body;
  if (!email) return respond(400, { error: "email is required" });

  if (resend) {
    try {
      await resendCode(email);
      return respond(200, { message: "Verification code resent" });
    } catch {
      return respond(500, { error: "Failed to resend code" });
    }
  }

  if (!code) return respond(400, { error: "code is required" });

  try {
    await confirmUser(email, code);
    return respond(200, { message: "Email verified successfully" });
  } catch (err) {
    if (err.name === "CodeMismatchException") return respond(400, { error: "Incorrect verification code" });
    if (err.name === "ExpiredCodeException") return respond(400, { error: "Code expired. Request a new one." });
    if (err.name === "NotAuthorizedException") return respond(400, { error: "Account already verified" });
    return respond(500, { error: "Verification failed. Please try again." });
  }
};
