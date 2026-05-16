import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { RekognitionClient, SearchFacesByImageCommand } from "@aws-sdk/client-rekognition";
import { v4 as uuidv4 } from "uuid";
import { getPatient } from "../shared/dynamodb.js";
import { invokeClaude } from "../shared/bedrock.js";
import { synthesizeSpeech } from "../shared/polly.js";

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

export const handler = async (event) => {
  if (event.requestContext?.http?.method === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch { return respond(400, { error: "Invalid JSON" }); }

  const { patientId, photoBase64 } = body;
  if (!patientId || !photoBase64) return respond(400, { error: "patientId and photoBase64 are required" });

  const patient = await getPatient(patientId);
  if (!patient) return respond(404, { error: "Patient not found" });

  try {
    const key = `identify-input/${uuidv4()}.jpg`;
    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_PHOTOS_BUCKET,
      Key: key,
      Body: Buffer.from(photoBase64, "base64"),
      ContentType: "image/jpeg"
    }));

    let matchedPerson = null;
    try {
      const searchResult = await rek.send(new SearchFacesByImageCommand({
        CollectionId: "memodi-faces",
        Image: { S3Object: { Bucket: process.env.S3_PHOTOS_BUCKET, Name: key } },
        FaceMatchThreshold: 80,
        MaxFaces: 1
      }));

      if (searchResult.FaceMatches?.length > 0) {
        const externalId = searchResult.FaceMatches[0].Face.ExternalImageId;
        const personName = externalId.split("__")[1]?.replace(/_/g, " ");
        matchedPerson = patient.familyMembers?.find(m =>
          m.name.toLowerCase() === personName?.toLowerCase()
        ) ?? null;
      }
    } catch (e) {
      console.warn("Rekognition search failed:", e.message);
    }

    const systemPrompt = `You are Memodi, a warm memory companion for ${patient.name}.
Generate a single warm, comforting sentence introducing or describing the person in the photo.
${matchedPerson ? `The person is ${matchedPerson.name} (${matchedPerson.relationship}). Their story: ${matchedPerson.story || "a loved one"}. ${matchedPerson.isDeceased ? matchedPerson.deceasedMessage || "" : ""}` : "The person was not recognized. Gently say so and offer comfort."}`;

    const description = await invokeClaude(systemPrompt, "Describe this person warmly in one sentence.", 128);
    const audioResponse = await synthesizeSpeech(description);

    return respond(200, { description, audioResponse, matched: !!matchedPerson, person: matchedPerson });
  } catch (err) {
    console.error("identifyPhoto error:", err);
    return respond(500, { error: err.message });
  }
};
