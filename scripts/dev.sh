#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

cleanup() {
  if [[ -n "${PIPER_PID:-}" ]] && kill -0 "$PIPER_PID" 2>/dev/null; then
    kill "$PIPER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

bash scripts/start-piper.sh &
PIPER_PID=$!

for _ in {1..30}; do
  if curl -sf "http://127.0.0.1:59125/health" >/dev/null 2>&1; then
    break
  fi
  sleep 0.5
done

if ! curl -sf "http://127.0.0.1:59125/health" >/dev/null 2>&1; then
  echo "Piper failed to start. Run: npm run piper:setup" >&2
  exit 1
fi

echo "Piper ready. Starting Next.js (local API + Piper)…"
echo "→ http://localhost:3000/auth/patient → Try demo"
cd web
exec npm run dev
