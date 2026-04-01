#!/usr/bin/env python3
"""
ChaosViewer webhook server — listens on 0.0.0.0:3040.
Validates X-Webhook-Secret, then runs update.sh asynchronously.
Run as a systemd service on the Docker host.

Setup:
  sudo cp scripts/chaosviewer-webhook.service /etc/systemd/system/
  sudo systemctl daemon-reload
  sudo systemctl enable --now chaosviewer-webhook
"""
import hmac
import http.server
import json
import logging
import os
import subprocess
import sys
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [webhook] %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_DIR = SCRIPT_DIR.parent
UPDATE_SCRIPT = PROJECT_DIR / "update.sh"
CHECK_SCRIPT = SCRIPT_DIR / "check-update.sh"
ENV_FILE = PROJECT_DIR / ".env"
PORT = 3040


def load_env_file(path: Path) -> dict:
    env = {}
    if not path.exists():
        return env
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        value = value.split("#")[0].strip().strip('"').strip("'")
        env[key.strip()] = value
    return env


def get_secret() -> str:
    env = load_env_file(ENV_FILE)
    secret = env.get("WEBHOOK_SECRET") or os.environ.get("WEBHOOK_SECRET", "")
    if not secret:
        log.error("WEBHOOK_SECRET is not set in .env — refusing to start")
        sys.exit(1)
    return secret


class UpdateHandler(http.server.BaseHTTPRequestHandler):
    secret: str = ""

    def log_message(self, fmt, *args):
        log.info("%s - %s", self.address_string(), fmt % args)

    def send_json(self, status: int, body: dict):
        data = json.dumps(body).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path == "/health":
            self.send_json(200, {"status": "ok"})
        else:
            self.send_json(404, {"error": "Not found"})

    def check_secret(self) -> bool:
        provided = self.headers.get("X-Webhook-Secret", "")
        if not hmac.compare_digest(provided, self.secret):
            log.warning("Rejected request: invalid secret from %s", self.client_address[0])
            self.send_json(403, {"error": "Forbidden"})
            return False
        return True

    def do_POST(self):
        if not self.check_secret():
            return

        if self.path == "/check":
            if not CHECK_SCRIPT.exists():
                self.send_json(500, {"error": "check-update.sh not found"})
                return
            log.info("Running check-update.sh...")
            result = subprocess.run(
                ["/usr/bin/env", "bash", str(CHECK_SCRIPT)],
                cwd=str(PROJECT_DIR),
                capture_output=True,
                text=True,
                timeout=30,
            )
            # Read flag file after check
            flag = PROJECT_DIR / "data" / ".update-available"
            count = int(flag.read_text().strip()) if flag.exists() and flag.is_file() else 0
            self.send_json(200, {"updateAvailable": count > 0, "updateCount": count})

        elif self.path == "/update":
            if not UPDATE_SCRIPT.exists():
                self.send_json(500, {"error": "update.sh not found"})
                return
            log.info("Launching update.sh asynchronously...")
            env = os.environ.copy()
            env["NONINTERACTIVE"] = "1"
            subprocess.Popen(
                ["/usr/bin/env", "bash", str(UPDATE_SCRIPT)],
                cwd=str(PROJECT_DIR),
                env=env,
                stdin=subprocess.DEVNULL,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                start_new_session=True,
            )
            self.send_json(202, {"status": "update started"})

        else:
            self.send_json(404, {"error": "Not found"})


def main():
    secret = get_secret()
    UpdateHandler.secret = secret
    server = http.server.HTTPServer(("0.0.0.0", PORT), UpdateHandler)
    log.info("Listening on 0.0.0.0:%d | project: %s", PORT, PROJECT_DIR)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        log.info("Shutting down")


if __name__ == "__main__":
    main()
