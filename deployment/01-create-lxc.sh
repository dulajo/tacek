#!/bin/bash
#
# Tácek LXC Container Creation Script for Proxmox
# Spusť tento skript v Proxmox shell
#

set -e

echo "🍺 Vytváření LXC kontejneru pro Tácek..."

# Konfigurace
CT_ID=110  # ID kontejneru (změň pokud už máš 110)
CT_HOSTNAME="tacek"
CT_PASSWORD="tacek123"  # Změň na silnější heslo!
CT_DISK_SIZE=8  # GB
CT_RAM=512  # MB
CT_CORES=1
CT_STORAGE="local-lvm"  # Změň podle tvého storage
CT_TEMPLATE="local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.zst"  # Ubuntu 22.04 template

# Kontrola zda template existuje
if ! pveam list local | grep -q "ubuntu-22.04"; then
    echo "📦 Stahuji Ubuntu 22.04 template..."
    pveam download local ubuntu-22.04-standard_22.04-1_amd64.tar.zst
fi

# Vytvoření kontejneru
echo "🔨 Vytvářím LXC kontejner ID ${CT_ID}..."
pct create ${CT_ID} ${CT_TEMPLATE} \
    --hostname ${CT_HOSTNAME} \
    --password ${CT_PASSWORD} \
    --cores ${CT_CORES} \
    --memory ${CT_RAM} \
    --rootfs ${CT_STORAGE}:${CT_DISK_SIZE} \
    --net0 name=eth0,bridge=vmbr0,ip=dhcp \
    --unprivileged 1 \
    --features nesting=1 \
    --onboot 1 \
    --start 1

echo "⏳ Čekám na start kontejneru..."
sleep 5

# Získání IP adresy
CT_IP=$(pct exec ${CT_ID} -- hostname -I | awk '{print $1}')
echo "✅ Kontejner vytvořen!"
echo ""
echo "📋 Informace o kontejneru:"
echo "   ID:       ${CT_ID}"
echo "   Hostname: ${CT_HOSTNAME}"
echo "   IP:       ${CT_IP}"
echo "   Password: ${CT_PASSWORD}"
echo ""
echo "🔐 Pro přístup:"
echo "   pct enter ${CT_ID}"
echo ""
echo "➡️  Další krok: Spusť skript 02-install-nginx.sh UVNITŘ kontejneru"
echo "   pct enter ${CT_ID}"
echo "   # pak uvnitř kontejneru spusť install skript"
