#!/bin/bash
# ChaosViewer — SQLite backup to TrueNAS via rsync over SSH
# Requires: sqlite3, rsync, ssh key auth configured for NAS_USER@NAS_HOST
#
# Setup (run once on server):
#   ssh-keygen -t ed25519 -f ~/.ssh/chaosviewer_backup -N ""
#   ssh-copy-id -i ~/.ssh/chaosviewer_backup.pub backup-chaosviewer@<NAS_HOST>
#
# Add to crontab (crontab -e):
#   0 3 * * * /path/to/chaosviewer/scripts/backup.sh >> /var/log/chaosviewer-backup.log 2>&1

set -euo pipefail

# ── Config (override via .env or environment) ────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Load .env if present
if [[ -f "$PROJECT_DIR/.env" ]]; then
  # shellcheck disable=SC1091
  set -a; source "$PROJECT_DIR/.env"; set +a
fi

DB_PATH="${DB_PATH:-$PROJECT_DIR/data/chaosviewer.db}"
NAS_HOST="${NAS_HOST:-}"
NAS_USER="${NAS_USER:-backup-chaosviewer}"
NAS_PATH="${NAS_PATH:-/mnt/DATA/chaosviewer}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/chaosviewer_backup}"
KEEP_DAYS="${KEEP_DAYS:-30}"
TMP_DIR="${TMPDIR:-/tmp}"

# ── Validate ──────────────────────────────────────────────────────────────────
if [[ -z "$NAS_HOST" ]]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: NAS_HOST is not set. Add it to .env"
  exit 1
fi

if [[ ! -f "$DB_PATH" ]]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Database not found at $DB_PATH"
  exit 1
fi

if [[ ! -f "$SSH_KEY" ]]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: SSH key not found at $SSH_KEY"
  echo "  Run: ssh-keygen -t ed25519 -f $SSH_KEY -N \"\""
  echo "  Then: ssh-copy-id -i ${SSH_KEY}.pub ${NAS_USER}@${NAS_HOST}"
  exit 1
fi

# ── Backup ────────────────────────────────────────────────────────────────────
TIMESTAMP="$(date '+%Y-%m-%d_%H-%M-%S')"
TMP_BACKUP="$TMP_DIR/chaosviewer_${TIMESTAMP}.db"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting backup → ${NAS_USER}@${NAS_HOST}:${NAS_PATH}"

# Safe hot backup using SQLite's Online Backup API (works while app is running)
sqlite3 "$DB_PATH" ".backup $TMP_BACKUP"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Snapshot created: $TMP_BACKUP ($(du -h "$TMP_BACKUP" | cut -f1))"

# Sync to NAS
rsync -az --no-perms \
  -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=accept-new -o BatchMode=yes" \
  "$TMP_BACKUP" \
  "${NAS_USER}@${NAS_HOST}:${NAS_PATH}/"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Synced to NAS successfully"

# Cleanup local tmp file
rm -f "$TMP_BACKUP"

# Remove backups older than KEEP_DAYS from NAS
ssh -i "$SSH_KEY" -o BatchMode=yes "${NAS_USER}@${NAS_HOST}" \
  "find ${NAS_PATH}/ -name 'chaosviewer_*.db' -mtime +${KEEP_DAYS} -delete"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Cleaned up NAS backups older than ${KEEP_DAYS} days"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup complete ✓"
