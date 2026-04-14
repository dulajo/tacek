#!/bin/bash
#
# Tácek Deployment Script
# Spusť tento skript na svém Macu pro deployment do LXC kontejneru
#

set -e

# Konfigurace - UPRAV PODLE SVÉHO PROSTŘEDÍ
LXC_IP="192.168.1.XXX"  # IP adresa LXC kontejneru (zjistíš z 01-create-lxc.sh)
LXC_USER="root"
LXC_PASSWORD="tacek123"  # Heslo z 01-create-lxc.sh
PROXMOX_IP="192.168.1.XXX"  # IP Proxmoxu
LXC_ID="110"  # ID kontejneru

echo "🍺 Tácek Deployment Script"
echo "=========================="
echo ""

# Kontrola že jsme v správném adresáři
if [ ! -f "package.json" ]; then
    echo "❌ Chyba: Musíš spustit skript z root adresáře projektu!"
    exit 1
fi

# Build aplikace
echo "📦 Builduji aplikaci..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Chyba: Build selhal, adresář dist neexistuje!"
    exit 1
fi

echo "✅ Build dokončen!"
echo ""

# Vytvoření deployment package
echo "📦 Vytvářím deployment package..."
cd dist
tar -czf ../tacek-dist.tar.gz .
cd ..

echo "✅ Package vytvořen: tacek-dist.tar.gz"
echo ""

# Informace pro manuální deployment
echo "📋 MANUÁLNÍ DEPLOYMENT:"
echo "======================"
echo ""
echo "1️⃣  Zkopíruj soubor na Proxmox:"
echo "   scp tacek-dist.tar.gz root@${PROXMOX_IP}:/tmp/"
echo ""
echo "2️⃣  Přihlas se na Proxmox:"
echo "   ssh root@${PROXMOX_IP}"
echo ""
echo "3️⃣  Zkopíruj do LXC kontejneru:"
echo "   pct push ${LXC_ID} /tmp/tacek-dist.tar.gz /tmp/tacek-dist.tar.gz"
echo ""
echo "4️⃣  Vstup do kontejneru:"
echo "   pct enter ${LXC_ID}"
echo ""
echo "5️⃣  Rozbal aplikaci:"
echo "   cd /var/www/tacek"
echo "   rm -rf *"
echo "   tar -xzf /tmp/tacek-dist.tar.gz"
echo "   rm /tmp/tacek-dist.tar.gz"
echo ""
echo "6️⃣  Test:"
echo "   curl http://localhost"
echo ""
echo "✅ Hotovo! Aplikace by měla běžet na http://${LXC_IP}"
echo ""
echo "➡️  Další krok: Nastav reverse proxy v Nginx Proxy Manager"
echo "   tacek.dulove.cz -> ${LXC_IP}:80"
