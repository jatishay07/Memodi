#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "$0")/../services/object-tracker" && pwd)"
VENV="$DIR/.venv"

if [[ ! -x "$VENV/bin/uvicorn" ]]; then
  echo "Object tracker dependencies are missing. Run: npm run tracker:setup" >&2
  exit 1
fi

cd "$DIR"
exec "$VENV/bin/uvicorn" server:app --host "${TRACKER_HOST:-127.0.0.1}" --port "${TRACKER_PORT:-59127}" --app-dir "$DIR"
