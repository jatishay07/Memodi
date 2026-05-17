#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")/../services/piper-tts" && pwd)"
VENV="$DIR/.venv"
export PIPER_VOICE="${PIPER_VOICE:-en_US-lessac-medium}"
export PIPER_MODEL="$DIR/voices/${PIPER_VOICE}.onnx"
exec "$VENV/bin/uvicorn" server:app --host "${PIPER_HOST:-127.0.0.1}" --port "${PIPER_PORT:-59125}" --app-dir "$DIR"
