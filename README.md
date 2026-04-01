# ChaosTracker

Selbst gehostete Projektverwaltung — dark, modern, simpel, PWA-fähig, auto update.
![ChaosTracker](mainPage.png)

---

## Features

- **Bereiche** — Projekte nach Themen gruppieren (z. B. Elektronik, Fahrzeuge) — editierbar mit Name, Farbe und Beschreibung
- **Aufgaben** — To-dos mit Status, Priorität und Fälligkeitsdatum
- **Probleme** — Bug/Issue-Tracking mit Schweregrad
- **Budget** — Ausgaben und Einnahmen pro Projekt (rollenbasiert, CHF)
- **Dateien** — Datei-Upload direkt ins Projekt
- **Links** — Wichtige URLs, Datenblätter, Repos
- **Versionen** — SW/HW/Firmware-Versionsverfolgung
- **Mehrbenutzer** — Login mit Rollen: Admin, Management, Benutzer
- **Persönliche Projekte** — Private Projekte mit Einladesystem
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
| Deployment | Docker / Docker Compose |

---

## Rollen

| Rolle | Beschreibung |
|---|---|
| **Admin** | Voller Zugriff, Benutzerverwaltung, Updates, Backup |
| **Management** | Projekte erstellen, Zugriffsrechte pro Projekt vergeben, Budget einsehen |
| **Benutzer** | Zugriff nur auf freigegebene Projekte, kann Aufgaben und Ausgaben eintragen |

---

## Erstinstallation (Docker)

**Voraussetzungen:**
- Docker + Docker Compose
- Git (auf dem Host, für Update-Funktion)

```bash
# 1. Repository klonen
git clone https://github.com/Obili69/chaosViewer.git
cd chaosViewer

# 2. Umgebungsvariablen konfigurieren
cp .env.example .env
# .env öffnen und Pflichtfelder setzen
```

`.env` bearbeiten:

```env
JWT_SECRET=<langer_zufälliger_string>    # openssl rand -hex 64
WEBHOOK_SECRET=<langer_zufälliger_string> # openssl rand -hex 32
ADMIN_USERNAME=admin
ADMIN_PASSWORD=meinPasswort

# Optional: Backup auf NAS via rsync/SSH
NAS_HOST=192.168.1.100
NAS_USER=backup-chaosviewer
NAS_PATH=/mnt/DATA/chaosviewer
SSH_KEY=/root/.ssh/chaosviewer_backup
```

```bash
# 3. Container bauen und starten
docker compose up -d --build
```

Die App ist erreichbar unter: **http://localhost:3039**

> **Hinweis:** `ADMIN_USERNAME` und `ADMIN_PASSWORD` werden beim ersten Start verwendet, um den Admin-Account zu erstellen. Danach können diese aus der `.env` entfernt werden — der Account bleibt in der Datenbank erhalten.

---

## Update

### Automatisch über die UI

Admin- und Management-Benutzer können im Benutzermenü (oben links) auf **„Nach Updates suchen"** klicken. Wenn neue Commits verfügbar sind, erscheint der Button **„Update durchführen"**. Der Container wird dann automatisch neu gebaut (~1–2 Min).

**Voraussetzung:** Der Webhook-Server muss auf dem Host laufen (siehe unten).

### Manuell

```bash
cd /pfad/zu/chaosViewer
chmod +x update.sh   # einmalig
./update.sh
```

Das Skript führt automatisch aus:
- Optionales Backup vor dem Update
- `git pull origin main`
- `docker compose build && docker compose up -d`

Datenbank-Schemaänderungen werden beim Container-Start automatisch angewendet.

---

## Webhook-Server (für UI-Updates)

Der Webhook-Server läuft auf dem Host und empfängt den Update-Befehl vom Container.

```bash
# Einmalig: systemd-Service installieren
sudo cp scripts/chaosviewer-webhook.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now chaosviewer-webhook
```

Der Server lauscht auf Port `3040` und ist nur aus dem lokalen Netz erreichbar.

---

## Backup

### Manuell über die UI

Im Benutzermenü → **„Backup starten"** — sichert die Datenbank direkt auf den NAS via rsync/SSH.

### Automatisch (Cron)

```bash
# Cron-Eintrag prüfen/hinzufügen (wird von update.sh automatisch gesetzt):
# 0 3 * * * /pfad/zu/chaosViewer/scripts/backup.sh >> /var/log/chaosviewer-backup.log 2>&1
```

**SSH-Key für NAS einrichten:**
```bash
ssh-keygen -t ed25519 -f ~/.ssh/chaosviewer_backup -N ""
ssh-copy-id -i ~/.ssh/chaosviewer_backup.pub backup-chaosviewer@<NAS_HOST>
```

---

## Datenspeicherung

```
chaosViewer/
├── data/       # SQLite-Datenbank (chaosviewer.db) — NICHT ins Git!
├── uploads/    # Hochgeladene Dateien — NICHT ins Git!
└── .env        # Konfiguration — NICHT ins Git!
```

**Backup:** `data/` und `uploads/` sichern genügt für ein vollständiges Backup.

---

## Konfiguration (.env)

| Variable | Beschreibung | Pflicht |
|---|---|---|
| `JWT_SECRET` | Zufälliger Secret für JWT-Tokens | Ja |
| `WEBHOOK_SECRET` | Secret für den Webhook-Server (Updates) | Ja |
| `ADMIN_USERNAME` | Admin-Benutzername (nur erster Start) | Einmalig |
| `ADMIN_PASSWORD` | Admin-Passwort (nur erster Start) | Einmalig |
| `NAS_HOST` | IP/Hostname des NAS für Backup | Optional |
| `NAS_USER` | SSH-Benutzer auf dem NAS | Optional |
| `NAS_PATH` | Zielpfad auf dem NAS | Optional |
| `SSH_KEY` | Pfad zum SSH-Key für NAS-Backup | Optional |

---

## Manuelle Docker-Befehle

```bash
# Status prüfen
docker compose ps

# Logs anzeigen
docker compose logs -f

# Container neu starten
docker compose restart

# Stoppen
docker compose down

# Image neu bauen (nach Code-Änderungen)
docker compose build && docker compose up -d
```

---

## PWA-Installation

### Android (Chrome)
1. App im Browser öffnen
2. Menü → **„Zum Startbildschirm hinzufügen"**

### iOS (Safari)
1. App in Safari öffnen
2. Teilen-Symbol → **„Zum Home-Bildschirm"**

---

## Entwicklung (lokal)

```bash
git clone https://github.com/Obili69/chaosViewer.git
cd chaosViewer
cp .env.example .env
# .env anpassen: DATABASE_URL=file:./data/chaosviewer.db, JWT_SECRET setzen
npm install
npx prisma db push
node scripts/create-admin.js admin geheim
npm run dev
```

Öffne `http://localhost:3039`
