#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIR="$ROOT/services/piper-tts"
VENV="$DIR/.venv"

cd "$DIR"

if [[ ! -d "$VENV" ]]; then
  echo "Creating Piper virtualenv..."
  python3 -m venv "$VENV"
  "$VENV/bin/pip" install -q 'piper-tts[http]' fastapi uvicorn
fi

if [[ ! -f "$DIR/voices/en_US-lessac-medium.onnx" ]]; then
  echo "Downloading Piper voice (one-time)..."
  "$VENV/bin/python3" -m piper.download_voices --data-dir "$DIR/voices" en_US-lessac-medium
fi

export PIPER_MODEL="$DIR/voices/en_US-lessac-medium.onnx"
HOST="${PIPER_HOST:-127.0.0.1}"
PORT="${PIPER_PORT:-59125}"

echo "Piper TTS → http://${HOST}:${PORT} (health: /health)"
exec "$VENV/bin/uvicorn" server:app --host "$HOST" --port "$PORT"
