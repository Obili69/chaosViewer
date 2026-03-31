# ChaosTracker

Selbst gehostete Projektverwaltung — dark, modern, PWA-fähig.

![ChaosTracker](public/icons/icon-192.png)

---

## Features

- **Bereiche** — Projekte nach Themen gruppieren (z. B. Elektronik, Fahrzeuge)
- **Aufgaben** — To-dos mit Status, Priorität und Fälligkeitsdatum
- **Probleme** — Bug/Issue-Tracking mit Schweregrad
- **Budget** — Ausgaben und Einnahmen pro Projekt
- **Dateien** — Datei-Upload direkt ins Projekt
- **Links** — Wichtige URLs, Datenblätter, Repos
- **Versionen** — SW/HW/Firmware-Versionsverfolgung
- **Mehrbenutzer** — Login mit Benutzerverwaltung (Admin/User)
- **PWA** — Auf dem Handy installierbar (Android & iOS)
- **Mobile-first** — Bottom-Navigation, Bottom-Sheets, optimiert für Touch

---

## Tech Stack

| Bereich | Technologie |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS v3 |
| Datenbank | SQLite via Prisma ORM |
| Auth | JWT (jose) + bcrypt |
| Prozess-Manager | PM2 |

---

## Erstinstallation (Server)

**Voraussetzungen:**
- Ubuntu 24 LTS
- Node.js 18+
- Git

```bash
# 1. Repository klonen
git clone https://github.com/Obili69/chaosViewer.git
cd chaosViewer

# 2. Installationsskript ausführbar machen und starten
chmod +x install.sh
./install.sh
```

Das Skript:
1. Installiert npm und PM2 (falls nötig)
2. Installiert alle Abhängigkeiten
3. Erstellt die `.env`-Datei mit zufälligem JWT-Secret
4. Richtet die SQLite-Datenbank ein
5. Fragt nach Benutzername und Passwort für den Admin-Account
6. Baut die Anwendung
7. Startet die App mit PM2

Die App ist danach erreichbar unter: **http://localhost:3039**

---

## Update

```bash
cd /home/kasm-user/gitProject/chaosViewer
chmod +x update.sh  # einmalig
./update.sh
```

Das Update-Skript führt automatisch aus:
- `git pull origin main`
- `npm install`
- Datenbankmigrationen
- `npm run build`
- `pm2 restart chaosviewer`

---

## Autostart nach Neustart

Nach der Installation einmalig ausführen:

```bash
pm2 startup
# Den ausgegebenen Befehl als root ausführen
pm2 save
```

---

## Manuelle Befehle

```bash
# Status prüfen
pm2 status chaosviewer

# Logs anzeigen
pm2 logs chaosviewer

# Neu starten
pm2 restart chaosviewer

# Stoppen
pm2 stop chaosviewer

# Datenbank-Studio (lokal, nicht auf dem Server offen lassen)
npm run db:studio

# Entwicklungsmodus (lokal)
cp .env.example .env
# .env anpassen
npm install
npx prisma migrate dev
npm run dev
```

---

## Verzeichnisstruktur (Datenspeicherung)

```
chaosViewer/
├── data/           # SQLite-Datenbank (chaosviewer.db) — NICHT ins Git!
├── uploads/        # Hochgeladene Dateien — NICHT ins Git!
├── logs/           # PM2-Logs — NICHT ins Git!
└── .env            # Konfiguration (JWT_SECRET etc.) — NICHT ins Git!
```

> **Backup**: Für ein vollständiges Backup genügt es, die Ordner `data/` und `uploads/` zu sichern.

---

## Konfiguration (.env)

```env
PORT=3039
NODE_ENV=production
DATABASE_URL="file:./data/chaosviewer.db"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=52428800       # 50 MB in Bytes
JWT_SECRET=<zufälliger Hex>  # Wird von install.sh generiert
```

---

## PWA-Installation

### Android (Chrome)
1. App im Browser öffnen: `http://10.1.90.13:3039`
2. Menü → **„Zum Startbildschirm hinzufügen"**

### iOS (Safari)
1. App in Safari öffnen
2. Teilen-Symbol → **„Zum Home-Bildschirm"**

---

## Erster Login

Nach der Installation mit den beim `install.sh` gewählten Admin-Zugangsdaten anmelden.

Weitere Benutzer anlegen: **Seitenleiste → Benutzer** (nur Admins sichtbar)

---

## Entwicklung (lokal)

```bash
git clone https://github.com/Obili69/chaosViewer.git
cd chaosViewer
cp .env.example .env
# .env anpassen: DATABASE_URL, JWT_SECRET
npm install
npx prisma migrate dev --name init
node scripts/create-admin.js admin geheim
npm run dev
```

Öffne `http://localhost:3039`
