import { DetectFacesCommand, RekognitionClient } from "@aws-sdk/client-rekognition";

const rekognition = new RekognitionClient({ region: process.env.AWS_REGION || "us-east-1" });

const CORS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

const NEGATIVE_EMOTIONS = new Set(["sad", "angry", "fear", "disgust"]);
const EMOTION_ORDER = ["happy", "neutral", "sad", "angry", "fear", "surprise", "disgust"];
const EMOTION_MAP = {
  HAPPY: "happy",
  CALM: "neutral",
  CONFUSED: "neutral",
  SAD: "sad",
  ANGRY: "angry",
  FEAR: "fear",
  SURPRISED: "surprise",
  DISGUSTED: "disgust",
  UNKNOWN: "neutral",
};

function respond(statusCode, body) {
  return {
    statusCode,
    headers: CORS,
    body: JSON.stringify(body),
  };
}

function parseBody(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch {
    return null;
  }
}

function decodeImage(imageBase64) {
  const raw = (imageBase64 || "").trim();
  const normalized = raw.includes(",") ? raw.split(",").pop() : raw;
  return Buffer.from(normalized, "base64");
}

function emptyScores() {
  return Object.fromEntries(EMOTION_ORDER.map(key => [key, 0]));
}

function normalizeEmotionScores(emotions = []) {
  const scores = emptyScores();
  for (const emotion of emotions) {
    const mapped = EMOTION_MAP[emotion.Type] || "neutral";
    scores[mapped] += Number(emotion.Confidence || 0);
  }
  return scores;
}

function dominantEmotion(scores) {
  return EMOTION_ORDER.reduce((best, key) => (
    scores[key] > scores[best] ? key : best
  ), EMOTION_ORDER[0]);
}

function pickPrimaryFace(faceDetails = []) {
  return faceDetails.reduce((best, current) => {
    if (!best) return current;
    const currentBox = current.BoundingBox || {};
    const bestBox = best.BoundingBox || {};
    const currentArea = (currentBox.Width || 0) * (currentBox.Height || 0);
    const bestArea = (bestBox.Width || 0) * (bestBox.Height || 0);
    return currentArea > bestArea ? current : best;
  }, null);
}

function toPixelRegion(box, width, height) {
  if (!box || !width || !height) return null;
  return {
    x: Math.max(0, Math.round((box.Left || 0) * width)),
    y: Math.max(0, Math.round((box.Top || 0) * height)),
    w: Math.max(0, Math.round((box.Width || 0) * width)),
    h: Math.max(0, Math.round((box.Height || 0) * height)),
  };
}

export const handler = async (event) => {
  const method = event.requestContext?.http?.method;

  if (method === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }

  if (method === "GET") {
    return respond(200, { status: "ok", engine: "rekognition", mode: "aws" });
  }

  if (method !== "POST") {
    return respond(405, { error: "Method not allowed" });
  }

  const body = parseBody(event);
  if (!body) {
    return respond(400, { error: "Invalid JSON" });
  }

  const { imageBase64, width, height } = body;
  if (!imageBase64) {
    return respond(400, { error: "imageBase64 is required" });
  }

  try {
    const imageBytes = decodeImage(imageBase64);
    const result = await rekognition.send(new DetectFacesCommand({
      Image: { Bytes: imageBytes },
      Attributes: ["ALL"],
    }));

    const primaryFace = pickPrimaryFace(result.FaceDetails || []);
    if (!primaryFace) {
      return respond(200, {
        faceDetected: false,
        engine: "rekognition",
        mode: "aws",
      });
    }

    const emotionScores = normalizeEmotionScores(primaryFace.Emotions || []);
    const dominant = dominantEmotion(emotionScores);

    return respond(200, {
      faceDetected: true,
      dominantEmotion: dominant,
      emotionScores,
      isDistressed: NEGATIVE_EMOTIONS.has(dominant),
      region: toPixelRegion(
        primaryFace.BoundingBox,
        Number(width) || 0,
        Number(height) || 0,
      ),
      engine: "rekognition",
      mode: "aws",
    });
  } catch (error) {
    console.error("analyzeEmotion error:", error);
    return respond(500, { error: "Emotion analysis failed" });
  }
};
