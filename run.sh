#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Starting LinkVault..."

npm --prefix "$ROOT_DIR/backend" run dev &
BACK_PID=$!

npm --prefix "$ROOT_DIR/frontend" run dev &
FRONT_PID=$!

echo "Backend:  http://localhost:4000"
echo "Frontend: http://localhost:5173"

if command -v open >/dev/null 2>&1; then
  open "http://localhost:5173" >/dev/null 2>&1 || true
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "http://localhost:5173" >/dev/null 2>&1 || true
fi

trap 'kill $BACK_PID $FRONT_PID' INT TERM
wait
