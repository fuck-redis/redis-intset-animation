#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"
export PM2_HOME="$ROOT_DIR/.pm2"
mkdir -p "$PM2_HOME"

pm2 delete redis-intset-animation >/dev/null 2>&1 || true
pm2 start ./start.sh --name redis-intset-animation
pm2 save >/dev/null 2>&1 || true
pm2 status redis-intset-animation
