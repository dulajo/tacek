#!/bin/bash
#
# Tacek Deployment Script
# Run this script on the Proxmox node shell (not on Mac)
# Proxmox web UI: https://server.dulove.cz:8006 → node → Shell
#

set -e

LXC_ID="114"
REPO="https://github.com/dulajo/tacek.git"
WORK_DIR="/tmp/tacek"
ARCHIVE="/tmp/tacek-dist.tar.gz"
WEB_ROOT="/var/www/tacek"

echo "🍺 Tacek Deployment Script"
echo "=========================="

# Clone and build
echo "📦 Cloning and building..."
rm -rf "$WORK_DIR" "$ARCHIVE"
cd /tmp
git clone "$REPO"
cd tacek

# Vite embeds env vars at build time, so .env must exist before build.
# The .env file is gitignored — we create it here.
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://greqhsslyyanbumotlzo.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_0mwT_YxyH3n8Wsa0hEFHeg_wnYrkcqu
EOF

npm install
npm run build

# Package
echo "📦 Creating deployment package..."
cd dist
tar czf "$ARCHIVE" .

# Deploy to LXC
echo "🚀 Deploying to LXC $LXC_ID..."
pct push "$LXC_ID" "$ARCHIVE" "$ARCHIVE"
pct exec "$LXC_ID" -- bash -c "rm -rf ${WEB_ROOT}/* && tar xzf ${ARCHIVE} -C ${WEB_ROOT} && rm ${ARCHIVE}"

# Verify
echo "🔍 Verifying..."
pct exec "$LXC_ID" -- curl -s http://localhost | head -5

# Cleanup
rm -rf "$WORK_DIR" "$ARCHIVE"

echo ""
echo "✅ Done! Verify at https://tacek.dulove.cz (Cmd+Shift+R to hard refresh)"
