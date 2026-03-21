#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

PORT_FILE=".codex-service-port"
if [ -f "$PORT_FILE" ]; then
  PORT="$(cat "$PORT_FILE" | tr -d '[:space:]')"
else
  PORT="46048"
  echo "$PORT" > "$PORT_FILE"
fi

if [ ! -d "node_modules" ]; then
  echo "[start.sh] node_modules 缺失，尝试安装依赖..."
  npm install --registry=https://registry.npmjs.org
fi

echo "[start.sh] Starting Vite on port ${PORT}"
exec npm run dev -- --host 0.0.0.0 --port "${PORT}"
