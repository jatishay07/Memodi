import { deleteFromPatientList, updatePatientListItem } from "../shared/dynamodb.js";

const CORS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

function respond(status, body) {
  return { statusCode: status, headers: CORS, body: JSON.stringify(body) };
}

const VALID_FIELDS = new Set(["familyMembers", "objects", "lifeHistory", "medications", "upcomingEvents"]);

export const handler = async (event) => {
  if (event.requestContext?.http?.method === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch { return respond(400, { error: "Invalid JSON" }); }

  const path = event.requestContext?.http?.path ?? "";
  const { patientId, field, index, item } = body;

  if (!patientId || !field || index == null) {
    return respond(400, { error: "patientId, field, and index are required" });
  }
  if (!VALID_FIELDS.has(field)) {
    return respond(400, { error: `Invalid field: ${field}` });
  }
  if (typeof index !== "number" || index < 0) {
    return respond(400, { error: "index must be a non-negative integer" });
  }

  try {
    if (path.endsWith("/memory/delete")) {
      await deleteFromPatientList(patientId, field, index);
      return respond(200, { success: true });
    }

    if (path.endsWith("/memory/edit")) {
      if (item === undefined) return respond(400, { error: "item is required for edit" });
      await updatePatientListItem(patientId, field, index, item);
      return respond(200, { success: true });
    }

    return respond(404, { error: "Not found" });
  } catch (err) {
    console.error("manageMemory error:", err);
    return respond(500, { error: err.message });
  }
};
