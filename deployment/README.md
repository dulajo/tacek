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
   CT_ID=110              # ID kontejneru (změň pokud 110 už existuje)
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
   pct enter 110
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

1. Na svém **Macu**, v projektu Tácek:
   ```bash
   cd /Users/josefdula/IdeaProjects/tacek
   ```

2. **UPRAV** `deployment/03-deploy.sh`:
   ```bash
   LXC_IP="192.168.1.150"     # IP z kroku 1
   PROXMOX_IP="192.168.1.XXX" # IP Proxmoxu
   LXC_ID="110"               # ID kontejneru
   ```

3. Udělej skript executable a spusť:
   ```bash
   chmod +x deployment/03-deploy.sh
   ./deployment/03-deploy.sh
   ```

4. Skript vytvoří `tacek-dist.tar.gz` a **vypíše manuální kroky**

5. Následuj vypísané kroky pro zkopírování do Proxmoxu

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

Když uděláš změny v kódu:

```bash
cd /Users/josefdula/IdeaProjects/tacek

# Commitni změny
git add .
git commit -m "fix: nějaká oprava"
git push

# Deploy
./deployment/03-deploy.sh
# Následuj vypísané kroky
```

---

## 🛠️ Troubleshooting

### Aplikace nejde otevřít
```bash
# V LXC kontejneru zkontroluj Nginx
pct enter 110
systemctl status nginx
nginx -t
```

### 502 Bad Gateway v NPM
- Zkontroluj že LXC kontejner běží: `pct status 110`
- Zkontroluj IP adresu: `pct exec 110 -- hostname -I`
- Zkontroluj že Nginx běží v kontejneru

### SSL certifikát nejde vytvořit
- Zkontroluj že port 80 a 443 jsou forward z routeru na NPM
- Zkontroluj DNS: `nslookup tacek.dulove.cz`

---

## 📁 Struktura

```
Proxmox
├── LXC 110 (tacek)
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
