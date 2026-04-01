#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "=========================================="
echo "  ChaosTracker - Erstinstallation"
echo "=========================================="
echo ""

# ── 1. Check Node ────────────────────────────
if ! command -v node &>/dev/null; then
  echo "[FEHLER] Node.js ist nicht installiert."
  echo "         Bitte Node.js 18+ installieren: https://nodejs.org"
  exit 1
fi
NODE_VER=$(node -e "process.stdout.write(process.version)")
echo "[OK] Node.js $NODE_VER gefunden"

# ── 2. Bootstrap npm if missing ──────────────
if ! command -v npm &>/dev/null; then
  echo "[INFO] npm nicht gefunden, versuche Installation über apt..."
  sudo apt-get install -y npm
fi
if ! command -v npm &>/dev/null; then
  echo "[FEHLER] npm konnte nicht installiert werden."
  echo "         Bitte manuell installieren: sudo apt-get install -y npm"
  exit 1
fi
echo "[OK] npm $(npm --version) gefunden"

# ── 3. Install PM2 globally ──────────────────
if ! command -v pm2 &>/dev/null; then
  echo "[INFO] PM2 wird installiert..."
  sudo npm install -g pm2
fi
echo "[OK] PM2 $(pm2 --version) gefunden"

# ── 4. Install dependencies ──────────────────
echo "[INFO] Abhängigkeiten werden installiert..."
npm install --production=false
echo "[OK] Abhängigkeiten installiert"

# ── 5. Create directories ────────────────────
mkdir -p data uploads logs
echo "[OK] Verzeichnisse angelegt (data/, uploads/, logs/)"

# ── 6. Generate .env if missing ──────────────
if [ ! -f .env ]; then
  echo "[INFO] .env wird erstellt..."
  JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
  cat > .env <<EOF
PORT=3039
NODE_ENV=production
DATABASE_URL="file:./data/chaosviewer.db"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=52428800
JWT_SECRET=$JWT_SECRET
EOF
  echo "[OK] .env erstellt mit zufälligem JWT_SECRET"
else
  echo "[OK] .env bereits vorhanden, wird beibehalten"
fi

# ── 7. Prisma generate + migrate ─────────────
echo "[INFO] Datenbankschema wird erstellt..."
npx prisma generate
npx prisma db push --accept-data-loss
echo "[OK] Datenbank bereit"

# ── 8. Generate icons ────────────────────────
if [ ! -f public/icons/icon-192.png ]; then
  echo "[INFO] PWA-Icons werden generiert..."
  node scripts/generate-icons.js 2>/dev/null || echo "[WARN] Icon-Generierung fehlgeschlagen (sharp nicht verfügbar) - Icons müssen manuell hinzugefügt werden"
fi

# ── 9. Create admin user ─────────────────────
echo ""
echo "Admin-Benutzer anlegen:"
read -p "  Benutzername: " ADMIN_USER
read -s -p "  Passwort: " ADMIN_PASS
echo ""
node scripts/create-admin.js "$ADMIN_USER" "$ADMIN_PASS"

# ── 10. Build Next.js ────────────────────────
echo "[INFO] Anwendung wird gebaut (das kann einige Minuten dauern)..."
npm run build
echo "[OK] Build abgeschlossen"

# ── 11. Copy static assets for standalone ────
echo "[INFO] Statische Dateien werden kopiert..."
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
echo "[OK] Statische Dateien kopiert"

# ── 12. Start with PM2 ───────────────────────
echo "[INFO] Anwendung wird gestartet..."
pm2 start ecosystem.config.js
pm2 save

echo ""
echo "=========================================="
echo "  Installation abgeschlossen!"
echo "=========================================="
echo ""
echo "  App läuft auf: http://10.1.90.13:3039"
echo ""
echo "  Autostart bei Systemstart einrichten:"
echo "  $ pm2 startup"
echo "  (den ausgegebenen Befehl als root ausführen)"
echo ""
pm2 status chaosviewer

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
