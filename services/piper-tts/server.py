import base64
import io
import os
import wave
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from piper import PiperVoice
from pydantic import BaseModel

ROOT = Path(__file__).resolve().parent
DEFAULT_MODEL = ROOT / "voices" / "en_US-lessac-medium.onnx"
MODEL_PATH = Path(os.environ.get("PIPER_MODEL", DEFAULT_MODEL))

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Piper voice not found at {MODEL_PATH}. Run: npm run piper:setup"
    )

voice = PiperVoice.load(MODEL_PATH)

app = FastAPI(title="Memodi Piper TTS")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get(
        "CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
    ).split(","),
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)


class SynthesizeRequest(BaseModel):
    text: str


@app.get("/health")
def health():
    return {"status": "ok", "engine": "piper", "model": str(MODEL_PATH.name)}


@app.post("/synthesize")
def synthesize(req: SynthesizeRequest):
    text = (req.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="text is required")

    with io.BytesIO() as wav_io:
        with wave.open(wav_io, "wb") as wav_file:
            voice.synthesize_wav(text, wav_file)
        audio = wav_io.getvalue()

    return {
        "audioBase64": base64.b64encode(audio).decode("ascii"),
        "mimeType": "audio/wav",
    }
