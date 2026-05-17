#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "$0")/../services/object-tracker" && pwd)"
VENV="$DIR/.venv"

python3 -m venv "$VENV"
"$VENV/bin/python" -m pip install --upgrade pip
"$VENV/bin/pip" install -r "$DIR/requirements.txt"
