#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIR="$ROOT/services/piper-tts"
VENV="$DIR/.venv"

cd "$DIR"
python3 -m venv "$VENV"
"$VENV/bin/pip" install -q 'piper-tts[http]' fastapi uvicorn
"$VENV/bin/python3" -m piper.download_voices --data-dir "$DIR/voices" en_US-lessac-medium
echo "Piper ready. Run: npm run piper:up"
