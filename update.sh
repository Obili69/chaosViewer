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

echo "[INFO] Abhängigkeiten werden aktualisiert..."
npm install --production=false

echo "[INFO] Datenbankschema wird aktualisiert..."
npx prisma generate
npx prisma db push

echo "[INFO] Anwendung wird neu gebaut..."
npm run build

echo "[INFO] Statische Dateien werden kopiert..."
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

echo "[INFO] Anwendung wird neu gestartet..."
pm2 restart chaosviewer

echo ""
echo "=========================================="
echo "  Update abgeschlossen!"
echo "=========================================="
echo ""
pm2 status chaosviewer
