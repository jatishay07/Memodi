#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

cleanup() {
  [[ -n "${PIPER_PID:-}" ]] && kill "$PIPER_PID" 2>/dev/null || true
  [[ -n "${DEEPFACE_PID:-}" ]] && kill "$DEEPFACE_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

bash scripts/start-piper.sh &
PIPER_PID=$!
for _ in {1..30}; do curl -sf http://127.0.0.1:59125/health >/dev/null && break; sleep 0.5; done
curl -sf http://127.0.0.1:59125/health >/dev/null || { echo "Piper failed"; exit 1; }

if [[ -d services/deepface-emotion/.venv ]]; then
  bash scripts/start-deepface.sh &
  DEEPFACE_PID=$!
  for _ in {1..60}; do curl -sf http://127.0.0.1:59126/health >/dev/null && break; sleep 1; done
fi

<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
echo "→ http://localhost:3000/auth/patient"
cd web && exec npm run dev
