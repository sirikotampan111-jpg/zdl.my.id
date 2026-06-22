#!/bin/bash
# ============================================================
# ZDS.asia — Manual Deploy Script
# Jalankan di server: bash scripts/deploy.sh
# ============================================================

set -e

echo "========================================="
echo "  ZDS.asia Deploy Script"
echo "  $(date)"
echo "========================================="

# --- Config (sesuaikan dengan server kamu) ---
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
echo ">>> Project dir: $PROJECT_DIR"
cd "$PROJECT_DIR"

# 1. Pull kode terbaru
echo ""
echo ">>> [1/4] Pulling latest code..."
git pull origin main

# 2. Install dependencies
echo ""
echo ">>> [2/4] Installing dependencies..."
if command -v bun &> /dev/null; then
  bun install --frozen-lockfile
else
  npm install
fi

# 3. Build
echo ""
echo ">>> [3/4] Building Next.js..."
if command -v bun &> /dev/null; then
  bun run build
else
  npm run build
fi

# 4. Restart service
echo ""
echo ">>> [4/4] Restarting service..."
if command -v pm2 &> /dev/null && pm2 list | grep -q "zds\|ZDS\|next"; then
  echo "    Restarting via pm2..."
  pm2 restart all
elif systemctl is-active --quiet zds-asia 2>/dev/null; then
  echo "    Restarting via systemctl..."
  systemctl restart zds-asia
else
  echo "    Restarting manually..."
  pkill -f "next start" 2>/dev/null || true
  sleep 2
  if command -v bun &> /dev/null; then
    nohup bun run start > /tmp/zds-asia.log 2>&1 &
  else
    nohup npm run start > /tmp/zds-asia.log 2>&1 &
  fi
  echo "    PID: $!"
fi

echo ""
echo "========================================="
echo "  Deploy selesai!"
echo "  $(date)"
echo "========================================="