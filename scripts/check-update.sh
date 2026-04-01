#!/usr/bin/env bash
# Prüft ob neue Commits auf origin/main vorhanden sind.
# Als Cron einrichten (z.B. stündlich):
#   0 * * * * /pfad/zu/chaosviewer/scripts/check-update.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DATA_DIR="$PROJECT_DIR/data"

cd "$PROJECT_DIR"
git fetch origin 2>/dev/null || exit 0

COUNT=$(git rev-list HEAD..origin/main --count 2>/dev/null || echo 0)

if [[ "$COUNT" -gt 0 ]]; then
  echo "$COUNT" > "$PROJECT_DIR/.update-available"
else
  rm -f "$PROJECT_DIR/.update-available"
fi
