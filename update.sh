#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "=========================================="
echo "  ChaosTracker - Update"
echo "=========================================="
echo ""

echo "[INFO] Neuesten Code wird heruntergeladen..."
git pull origin main

echo "[INFO] Docker-Image wird neu gebaut..."
docker compose build

echo "[INFO] Container wird neu gestartet..."
docker compose up -d

echo ""
echo "=========================================="
echo "  Update abgeschlossen!"
echo "=========================================="
echo ""
docker compose ps
