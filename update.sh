#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "=========================================="
echo "  ChaosTracker - Update"
echo "=========================================="
echo ""

# ── Update-Check ─────────────────────────────
echo "[INFO] Prüfe auf neue Versionen..."
git fetch origin 2>/dev/null || echo "[WARN] git fetch fehlgeschlagen (kein Netzwerk?)"
UPDATE_COUNT=$(git rev-list HEAD..origin/main --count 2>/dev/null || echo 0)
if [[ "$UPDATE_COUNT" -eq 0 ]]; then
  echo "[OK] Bereits auf dem neuesten Stand."
  read -r -p "     Trotzdem neu bauen? [y/N] " confirm
  [[ "${confirm,,}" == "y" ]] || { echo "Abgebrochen."; exit 0; }
else
  echo "[INFO] $UPDATE_COUNT neue Commit(s) verfügbar."
fi

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

# ── Code aktualisieren (lokale Modeänderungen ignorieren) ────
echo "[INFO] Neuesten Code wird heruntergeladen..."
git config core.fileMode false
git stash 2>/dev/null || true
git pull origin main
git stash pop 2>/dev/null || true

# ── Versionsdatei schreiben (für Update-Anzeige im UI) ───────
mkdir -p "$SCRIPT_DIR/data"
git rev-parse --short HEAD > "$SCRIPT_DIR/data/.version" 2>/dev/null || true
rm -f "$SCRIPT_DIR/data/.update-available"

# ── Docker neu bauen + starten ───────────────
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
if crontab -l 2>/dev/null | grep -q "$BACKUP_SCRIPT"; then
  echo "[OK] Backup-Cronjob ist eingerichtet"
else
  echo "[WARN] Kein Backup-Cronjob gefunden!"
  echo "       Einrichten mit: crontab -e"
  echo "       Zeile hinzufügen:"
  echo "       0 3 * * * $BACKUP_SCRIPT >> /var/log/chaosviewer-backup.log 2>&1"
fi
