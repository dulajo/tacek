# 🍺 Tácek - Deployment Guide

Návod na nasazení Tácek aplikace na Proxmox LXC kontejner s Docker Compose a Nginx Proxy Manager.

---

## 📋 Prerekvizity

- ✅ Proxmox VE server
- ✅ Nginx Proxy Manager (NPM) běžící v LXC/Docker
- ✅ Veřejná IP + doména dulove.cz
- ✅ Docker & Docker Compose (instaluje se automaticky v kroku 1)

---

## 🚀 Deployment kroky

### **Krok 1: Vytvoř LXC kontejner na Proxmoxu**

1. Přihlas se do Proxmox shell (web UI nebo SSH)
2. Zkopíruj obsah `deployment/01-create-lxc.sh` do Proxmox shellu
3. **UPRAV** konfiguraci v skriptu:
   ```bash
   CT_ID=110              # ID kontejneru (změň pokud 110 už existuje)
   CT_PASSWORD="..."      # Změň na silnější heslo!
   CT_STORAGE="local-lvm" # Tvůj storage pool
   ```
4. Spusť skript:
   ```bash
   bash 01-create-lxc.sh
   ```
5. **Zapiš si IP adresu** kontejneru (např. `192.168.1.150`)

Skript automaticky nainstaluje Docker a Docker Compose uvnitř kontejneru.

---

### **Krok 2: (Volitelné) Ruční instalace Dockeru**

Pokud jsi nepoužil `01-create-lxc.sh` nebo potřebuješ Docker nainstalovat znovu, viz `deployment/02-install-docker.sh` (referenční skript).

Docker se instaluje automaticky v kroku 1, takže tento krok je obvykle zbytečný.

---

### **Krok 3: Deploy s Docker Compose**

Deploy se provádí z **Proxmox node shellu**.

1. Otevři Proxmox web UI: **https://server.dulove.cz:8006**
2. Jdi na hlavní node → **Shell**
3. Spusť deploy skript `deployment/03-deploy.sh`, nebo ručně:

   ```bash
   # Clone repo do LXC
   pct exec 110 -- bash -c "cd /opt && git clone https://github.com/dulajo/tacek.git"

   # Vytvoř .env uvnitř LXC
   pct exec 110 -- bash -c "cat > /opt/tacek/.env << 'EOF'
   DATABASE_URL=postgresql://tacek:CHANGE_ME@postgres:5432/tacek
   POSTGRES_PASSWORD=CHANGE_ME
   EOF"

   # Spusť Docker Compose
   pct exec 110 -- bash -c "cd /opt/tacek && docker compose up -d --build"
   ```

4. Ověř že kontejnery běží:
   ```bash
   pct exec 110 -- docker compose -f /opt/tacek/docker-compose.yml ps
   ```

---

### **Krok 4: Nastav DNS (AdGuard Home)**

1. Přihlas se do AdGuard Admin (např. `http://192.168.1.XXX:3000`)
2. Jdi na **Filters** → **DNS rewrites** (nebo Custom rules)
3. Přidej DNS záznam:
   ```
   tacek.dulove.cz → 192.168.1.XXX (IP Nginx Proxy Manager)
   ```

---

### **Krok 5: Nastav Nginx Proxy Manager**

1. Přihlas se do NPM (např. `https://npm.dulove.cz`)

2. **Proxy Hosts** → **Add Proxy Host**

3. Vyplň:
   - **Domain Names**: `tacek.dulove.cz`
   - **Scheme**: `http`
   - **Forward Hostname / IP**: `192.168.1.150` (IP LXC kontejneru)
   - **Forward Port**: `80` (nginx kontejner z Docker Compose)
   - ✅ **Cache Assets**
   - ✅ **Block Common Exploits**
   - ✅ **Websockets Support**

4. **SSL** tab:
   - ✅ **Force SSL**
   - ✅ **HTTP/2 Support**
   - **SSL Certificate**: Request a new SSL Certificate (Let's Encrypt)
   - ✅ **I Agree to the Let's Encrypt Terms of Service**

5. **Save**

---

### **Krok 6: Test! 🎉**

1. Otevři `https://tacek.dulove.cz`
2. Měla by se zobrazit Tácek aplikace
3. Zkus přidat člena, událost, atd.

---

## 🔄 Opakované deploymenty (update aplikace)

1. Commitni a pushni změny na GitHub
2. Otevři Proxmox web UI: **https://server.dulove.cz:8006** → node → Shell
3. Spusť:
   ```bash
   pct exec 110 -- bash -c "cd /opt/tacek && git pull && docker compose up -d --build"
   ```
   Nebo použij skript `deployment/03-deploy.sh`.
4. Ověř na https://tacek.dulove.cz (hard refresh: Cmd+Shift+R)

---

## 🛠️ Troubleshooting

### Aplikace nejde otevřít
```bash
# Zkontroluj Docker kontejnery v LXC
pct exec 110 -- docker compose -f /opt/tacek/docker-compose.yml ps
pct exec 110 -- docker compose -f /opt/tacek/docker-compose.yml logs
```

### 502 Bad Gateway v NPM
- Zkontroluj že LXC kontejner běží: `pct status 110`
- Zkontroluj IP adresu: `pct exec 110 -- hostname -I`
- Zkontroluj že Docker kontejnery běží: `pct exec 110 -- docker ps`

### Databáze nefunguje
```bash
# Zkontroluj postgres kontejner
pct exec 110 -- docker compose -f /opt/tacek/docker-compose.yml logs postgres
```

### SSL certifikát nejde vytvořit
- Zkontroluj že port 80 a 443 jsou forward z routeru na NPM
- Zkontroluj DNS: `nslookup tacek.dulove.cz`

---

## 📁 Architektura

```
Proxmox
├── LXC 110 (tacek)
│   └── Docker Compose
│       ├── postgres   (PostgreSQL databáze)
│       ├── api        (Backend API)
│       └── nginx :80  (Reverse proxy + SPA)
│
├── LXC/Docker (npm)
│   └── Nginx Proxy Manager :80, :443
│
└── Internet
    └── tacek.dulove.cz
        └── Let's Encrypt SSL
```

---

## 🔐 Bezpečnost

- ✅ HTTPS (Let's Encrypt)
- ✅ LXC kontejner (izolace)
- ✅ Unprivileged LXC
- ✅ Docker kontejnery (další izolace)
- ✅ PostgreSQL v privátní Docker síti
- ✅ Private GitHub repo
- ⚠️ **ZMĚŇ** výchozí heslo v `01-create-lxc.sh`!
- ⚠️ **ZMĚŇ** `POSTGRES_PASSWORD` v `.env`!
