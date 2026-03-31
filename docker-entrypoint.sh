#!/bin/sh
set -e

echo ""
echo "=========================================="
echo "  ChaosTracker"
echo "=========================================="
echo ""

# Generate Prisma client for the correct runtime (linux-musl-openssl-3.0.x)
echo "[INFO] Prisma Client wird generiert..."
prisma generate
echo "[OK] Prisma Client bereit"

# Apply schema changes (idempotent — safe to run on every start)
echo "[INFO] Datenbankschema wird aktualisiert..."
prisma db push --skip-generate --accept-data-loss
echo "[OK] Datenbank bereit"

# Create admin user if env vars are set (skipped silently if user already exists)
if [ -n "${ADMIN_USERNAME:-}" ] && [ -n "${ADMIN_PASSWORD:-}" ]; then
  echo "[INFO] Admin-Benutzer wird geprüft..."
  node /app/scripts/create-admin.js "$ADMIN_USERNAME" "$ADMIN_PASSWORD"
fi

echo "[INFO] Server wird gestartet auf Port $PORT..."
echo ""
exec node /app/server.js
