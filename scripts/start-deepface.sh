#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")/../services/deepface-emotion" && pwd)"
exec "$DIR/.venv/bin/uvicorn" server:app --host "${DEEPFACE_HOST:-127.0.0.1}" --port "${DEEPFACE_PORT:-59126}" --app-dir "$DIR"
