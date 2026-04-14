#!/bin/bash
#
# Tácek Nginx Installation Script
# Spusť tento skript UVNITŘ LXC kontejneru
#

set -e

echo "🍺 Instalace Nginx pro Tácek..."

# Update systému
echo "📦 Aktualizuji systém..."
apt update && apt upgrade -y

# Instalace Nginx
echo "🔧 Instaluji Nginx..."
apt install -y nginx curl wget unzip

# Vytvoření adresáře pro aplikaci
echo "📁 Vytvářím adresář pro aplikaci..."
mkdir -p /var/www/tacek

# Nginx konfigurace
echo "⚙️  Vytvářím Nginx konfiguraci..."
cat > /etc/nginx/sites-available/tacek <<'EOF'
server {
    listen 80;
    server_name _;
    
    root /var/www/tacek;
    index index.html;
    
    # Gzip komprese
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
    
    # SPA routing - všechny požadavky směřuj na index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache statických souborů
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

# Aktivace konfigurace
ln -sf /etc/nginx/sites-available/tacek /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx konfigurace
echo "✅ Testuji Nginx konfiguraci..."
nginx -t

# Restart Nginx
echo "🔄 Restartuji Nginx..."
systemctl enable nginx
systemctl restart nginx

# Placeholder index.html
cat > /var/www/tacek/index.html <<'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Tácek - Připravuje se...</title>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            text-align: center;
        }
        h1 { font-size: 3em; margin: 0; }
        p { font-size: 1.2em; opacity: 0.9; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🍺 Tácek</h1>
        <p>Kde přátelství končí a dluhy začínají</p>
        <p style="font-size: 0.9em; margin-top: 2em;">Aplikace se připravuje k nasazení...</p>
    </div>
</body>
</html>
EOF

echo ""
echo "✅ Nginx nainstalován a nakonfigurován!"
echo ""
echo "📋 Informace:"
echo "   Web root:     /var/www/tacek"
echo "   Nginx config: /etc/nginx/sites-available/tacek"
echo ""
echo "🌐 Test:"
CT_IP=$(hostname -I | awk '{print $1}')
echo "   Otevři v prohlížeči: http://${CT_IP}"
echo ""
echo "➡️  Další krok: Nahraj build aplikace do /var/www/tacek"
echo "   Použij skript 03-deploy.sh na svém Macu"
