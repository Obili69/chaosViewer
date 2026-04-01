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

# ── Backup vor dem Update ────────────────────
BACKUP_SCRIPT="$SCRIPT_DIR/scripts/backup.sh"
if [[ -f "$BACKUP_SCRIPT" ]]; then
  echo "[INFO] Backup wird erstellt..."
  if bash "$BACKUP_SCRIPT"; then
    echo "[OK] Backup erfolgreich"
  else
    echo "[WARN] Backup fehlgeschlagen!"
    read -r -p "         Trotzdem fortfahren? [y/N] " confirm
    [[ "${confirm,,}" == "y" ]] || { echo "Update abgebrochen."; exit 1; }
  fi
else
  echo "[WARN] Backup-Script nicht gefunden, übersprungen"
fi

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

# ── Cron-Check für Backup ────────────────────
echo ""
BACKUP_SCRIPT="$SCRIPT_DIR/scripts/backup.sh"
if crontab -l 2>/dev/null | grep -q "$BACKUP_SCRIPT"; then
  echo "[OK] Backup-Cronjob ist eingerichtet"
else
  echo "[WARN] Kein Backup-Cronjob gefunden!"
  echo "       Einrichten mit: crontab -e"
  echo "       Zeile hinzufügen:"
  echo "       0 3 * * * $BACKUP_SCRIPT >> /var/log/chaosviewer-backup.log 2>&1"
fi
