import base64
import os
from typing import Any

import cv2
import numpy as np
from deepface import DeepFace
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

DISTRESS_EMOTIONS = frozenset({"sad", "angry", "fear", "disgust"})
DETECTOR_BACKEND = os.environ.get("DEEPFACE_DETECTOR", "opencv")

app = FastAPI(title="Memodi DeepFace Emotion")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(","),
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    imageBase64: str


def _decode_image(image_b64: str) -> np.ndarray:
    raw = base64.b64decode(image_b64.split(",")[-1] if "," in image_b64 else image_b64)
    img = cv2.imdecode(np.frombuffer(raw, dtype=np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Could not decode image")
    return img


def _analyze_frame(img: np.ndarray) -> dict[str, Any]:
    try:
        results = DeepFace.analyze(
            img, actions=["emotion"], enforce_detection=False,
            detector_backend=DETECTOR_BACKEND, silent=True,
        )
    except Exception as exc:
        return {"faceDetected": False, "error": str(exc)}
    if not results:
        return {"faceDetected": False}
    face = results[0] if isinstance(results, list) else results
    scores = face.get("emotion") or {}
    if not scores:
        return {"faceDetected": False}
    dominant = max(scores.items(), key=lambda x: x[1])[0]
    region = face.get("region") or {}
    return {
        "faceDetected": True,
        "dominantEmotion": dominant,
        "emotionScores": {k: float(v) for k, v in scores.items()},
        "isDistressed": dominant in DISTRESS_EMOTIONS,
        "region": {"x": int(region.get("x", 0)), "y": int(region.get("y", 0)),
                   "w": int(region.get("w", 0)), "h": int(region.get("h", 0))},
    }


@app.get("/health")
def health():
    return {"status": "ok", "engine": "deepface", "detector": DETECTOR_BACKEND}


@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    if not (req.imageBase64 or "").strip():
        raise HTTPException(status_code=400, detail="imageBase64 is required")
    return _analyze_frame(_decode_image(req.imageBase64.strip()))
