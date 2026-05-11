#!/bin/bash
#
# Tacek Deployment Script (Docker Compose)
# Run this script on the Proxmox node shell (not inside the LXC)
# Proxmox web UI: https://server.dulove.cz:8006 → node → Shell
#

set -e

LXC_ID="110"
REPO="https://github.com/dulajo/tacek.git"
APP_DIR="/opt/tacek"

echo "🍺 Tacek Deployment Script (Docker Compose)"
echo "============================================="

# Check if already deployed (update) or fresh deploy
if pct exec "$LXC_ID" -- test -d "$APP_DIR/.git" 2>/dev/null; then
    echo "📦 Existing installation found. Updating..."
    pct exec "$LXC_ID" -- bash -c "cd ${APP_DIR} && git pull"
    echo "🚀 Rebuilding and restarting containers..."
    pct exec "$LXC_ID" -- bash -c "cd ${APP_DIR} && docker compose up -d --build"
else
    echo "📦 Fresh deployment. Cloning repository..."
    pct exec "$LXC_ID" -- bash -c "mkdir -p $(dirname ${APP_DIR}) && git clone ${REPO} ${APP_DIR}"

    echo "⚙️  Creating .env file..."
    pct exec "$LXC_ID" -- bash -c "cat > ${APP_DIR}/.env << 'EOF'
DATABASE_URL=postgresql://tacek:CHANGE_ME@postgres:5432/tacek
POSTGRES_DB=tacek
POSTGRES_USER=tacek
POSTGRES_PASSWORD=CHANGE_ME
VITE_API_URL=/api
EOF"

    echo "⚠️  IMPORTANT: Edit ${APP_DIR}/.env inside LXC ${LXC_ID} and change POSTGRES_PASSWORD!"
    echo "   pct exec ${LXC_ID} -- nano ${APP_DIR}/.env"
    echo ""
    read -p "Press Enter after editing .env, or Ctrl+C to abort..."

    echo "🚀 Starting Docker Compose..."
    pct exec "$LXC_ID" -- bash -c "cd ${APP_DIR} && docker compose up -d --build"
fi

# Verify
echo ""
echo "🔍 Verifying containers..."
pct exec "$LXC_ID" -- docker compose -f "${APP_DIR}/docker-compose.yml" ps

echo ""
echo "✅ Done! Verify at https://tacek.dulove.cz (Cmd+Shift+R to hard refresh)"
