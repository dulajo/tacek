# 🍺 Tácek - Deployment Guide

Návod na nasazení Tácek aplikace na Proxmox LXC kontejner s Nginx Proxy Manager.

---

## 📋 Prerekvizity

- ✅ Proxmox VE server
- ✅ Nginx Proxy Manager (NPM) běžící v LXC/Docker
- ✅ Veřejná IP + doména dulove.cz
- ✅ AdGuard Home / DNS server

---

## 🚀 Deployment kroky

### **Krok 1: Vytvoř LXC kontejner na Proxmoxu**

1. Přihlas se do Proxmox shell (web UI nebo SSH)
2. Zkopíruj obsah `deployment/01-create-lxc.sh` do Proxmox shellu
3. **UPRAV** konfiguraci v skriptu:
   ```bash
   CT_ID=114              # ID kontejneru (změň pokud 114 už existuje)
   CT_PASSWORD="..."      # Změň na silnější heslo!
   CT_STORAGE="local-lvm" # Tvůj storage pool
   ```
4. Spusť skript:
   ```bash
   bash 01-create-lxc.sh
   ```
5. **Zapiš si IP adresu** kontejneru (např. `192.168.1.150`)

---

### **Krok 2: Instaluj Nginx v LXC kontejneru**

1. Vstup do kontejneru:
   ```bash
   pct enter 114
   ```

2. Zkopíruj obsah `deployment/02-install-nginx.sh` do kontejneru
   ```bash
   nano /tmp/install-nginx.sh
   # Vlož obsah skriptu, uložit Ctrl+O, Enter, Ctrl+X
   chmod +x /tmp/install-nginx.sh
   bash /tmp/install-nginx.sh
   ```

3. Po dokončení otevři v prohlížeči `http://IP_KONTEJNERU` (měl by se zobrazit placeholder)

4. Vystup z kontejneru:
   ```bash
   exit
   ```

---

### **Krok 3: Build a deploy aplikace**

Deploy se provádí přímo z **Proxmox node shellu** (ne z Macu).

1. Otevři Proxmox web UI: **https://server.dulove.cz:8006**
2. Jdi na hlavní node → **Shell**
3. Spusť tyto příkazy:
   ```bash
   cd /tmp
   git clone https://github.com/dulajo/tacek.git
    cd tacek

    # Create .env (Vite embeds env vars at build time, .env is gitignored)
    cat > .env << 'EOF'
    VITE_SUPABASE_URL=https://greqhsslyyanbumotlzo.supabase.co
    VITE_SUPABASE_ANON_KEY=sb_publishable_0mwT_YxyH3n8Wsa0hEFHeg_wnYrkcqu
    EOF

    npm install
   npm run build
   cd dist && tar czf /tmp/tacek-dist.tar.gz .
   pct push 114 /tmp/tacek-dist.tar.gz /tmp/tacek-dist.tar.gz
   pct exec 114 -- bash -c "rm -rf /var/www/tacek/* && tar xzf /tmp/tacek-dist.tar.gz -C /var/www/tacek && rm /tmp/tacek-dist.tar.gz"
   pct exec 114 -- curl -s http://localhost | head -5
   rm -rf /tmp/tacek /tmp/tacek-dist.tar.gz
   ```

   Nebo použij skript `deployment/03-deploy.sh` (zkopíruj na Proxmox node a spusť).

**Prerekvizity na Proxmox node:** nodejs, npm, git (již nainstalováno).

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
   - **Forward Port**: `80`
   - ✅ **Cache Assets**
   - ✅ **Block Common Exploits**
   - ✅ **Websockets Support**

4. **SSL** tab:
   - ✅ **Force SSL**
   - ✅ **HTTP/2 Support**
   - **SSL Certificate**: Request a new SSL Certificate (Let's Encrypt)
   - ✅ **Force SSL**
   - ✅ **I Agree to the Let's Encrypt Terms of Service**

5. **Save**

---

### **Krok 6: Nastav Supabase CORS**

1. Přihlas se na https://supabase.com
2. Vyber projekt `greqhsslyyanbumotlzo`
3. **Settings** → **API** → **URL Configuration**
4. Přidej do **Allowed origins**:
   ```
   https://tacek.dulove.cz
   ```
5. Save

---

### **Krok 7: Test! 🎉**

1. Otevři `https://tacek.dulove.cz`
2. Měla by se zobrazit Tácek aplikace
3. Zkus přidat člena, událost, atd.

---

## 🔄 Opakované deploymenty (update aplikace)

1. Commitni a pushni změny na GitHub
2. Otevři Proxmox web UI: **https://server.dulove.cz:8006** → node → Shell
3. Spusť příkazy z Kroku 3 výše (nebo `03-deploy.sh`)
4. Ověř na https://tacek.dulove.cz (hard refresh: Cmd+Shift+R)

---

## 🛠️ Troubleshooting

### Aplikace nejde otevřít
```bash
# V LXC kontejneru zkontroluj Nginx
pct enter 114
systemctl status nginx
nginx -t
```

### 502 Bad Gateway v NPM
- Zkontroluj že LXC kontejner běží: `pct status 114`
- Zkontroluj IP adresu: `pct exec 114 -- hostname -I`
- Zkontroluj že Nginx běží v kontejneru

### SSL certifikát nejde vytvořit
- Zkontroluj že port 80 a 443 jsou forward z routeru na NPM
- Zkontroluj DNS: `nslookup tacek.dulove.cz`

---

## 📁 Struktura

```
Proxmox
├── LXC 114 (tacek)
│   ├── Nginx :80
│   └── /var/www/tacek (aplikace)
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
- ✅ Nginx security headers
- ✅ Private GitHub repo
- ⚠️ **ZMĚŇ** výchozí heslo v `01-create-lxc.sh`!

---

Máš-li problémy, napiš! 🍺
