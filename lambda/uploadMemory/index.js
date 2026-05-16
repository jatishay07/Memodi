import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { RekognitionClient, IndexFacesCommand } from "@aws-sdk/client-rekognition";
import { v4 as uuidv4 } from "uuid";
import { appendToPatientList } from "../shared/dynamodb.js";

const s3 = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });
const rek = new RekognitionClient({ region: process.env.AWS_REGION || "us-east-1" });

const CORS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "POST,OPTIONS"
};

function respond(status, body) {
  return { statusCode: status, headers: CORS, body: JSON.stringify(body) };
}

async function uploadPhotoToS3(patientId, photoBase64) {
  const key = `photos/${patientId}/${uuidv4()}.jpg`;
  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_PHOTOS_BUCKET,
    Key: key,
    Body: Buffer.from(photoBase64, "base64"),
    ContentType: "image/jpeg"
  }));
  return `https://${process.env.S3_PHOTOS_BUCKET}.s3.amazonaws.com/${key}`;
}

async function indexFaceInRekognition(patientId, photoBase64, personName) {
  try {
    await rek.send(new IndexFacesCommand({
      CollectionId: "memodi-faces",
      Image: { Bytes: Buffer.from(photoBase64, "base64") },
      ExternalImageId: `${patientId}__${personName.replace(/\s/g, "_")}`,
      MaxFaces: 1
    }));
  } catch (e) {
    console.warn("Rekognition index failed (collection may not exist):", e.message);
  }
}

export const handler = async (event) => {
  if (event.requestContext?.http?.method === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch { return respond(400, { error: "Invalid JSON" }); }

  const { patientId, memoryType, data, photoBase64 } = body;
  if (!patientId || !memoryType || !data) {
    return respond(400, { error: "patientId, memoryType, and data are required" });
  }

  try {
    switch (memoryType) {
      case "person": {
        let photoUrl = null;
        if (photoBase64) {
          photoUrl = await uploadPhotoToS3(patientId, photoBase64);
          await indexFaceInRekognition(patientId, photoBase64, data.name);
        }
        await appendToPatientList(patientId, "familyMembers", { ...data, photoUrl });
        break;
      }
      case "object":
        await appendToPatientList(patientId, "objects", data);
        break;
      case "lifeHistory":
        await appendToPatientList(patientId, "lifeHistory", data.fact || data);
        break;
      case "medication":
        await appendToPatientList(patientId, "medications", data);
        break;
      case "event":
        await appendToPatientList(patientId, "upcomingEvents", data);
        break;
      default:
        return respond(400, { error: `Unknown memoryType: ${memoryType}` });
    }

    return respond(200, { success: true });
  } catch (err) {
    console.error("uploadMemory error:", err);
    return respond(500, { error: err.message });
  }
};
