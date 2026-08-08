#!/bin/bash
# VidLode VPS Deployment Script
# Run on Oracle Cloud Free Tier (Ubuntu 22.04+)

set -e

echo "=== VidLode Backend Setup ==="

# Install system dependencies
echo "[1/5] Installing system packages..."
sudo apt-get update -qq
sudo apt-get install -y python3 python3-pip python3-venv ffmpeg nginx certbot python3-certbot-nginx

# Create app directory
echo "[2/5] Setting up application..."
sudo mkdir -p /opt/vidlode
sudo chown $USER:$USER /opt/vidlode
cp server.py /opt/vidlode/
cp requirements.txt /opt/vidlode/

# Set up Python venv
cd /opt/vidlode
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Verify yt-dlp
echo "[3/5] Verifying yt-dlp..."
./venv/bin/yt-dlp --version

# Create systemd service
echo "[4/5] Creating systemd service..."
sudo tee /etc/systemd/system/vidlode.service << 'EOF'
[Unit]
Description=VidLode yt-dlp Parser Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/vidlode
ExecStart=/opt/vidlode/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8080 --workers 4
Restart=always
RestartSec=5
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable vidlode
sudo systemctl start vidlode

# Set up nginx reverse proxy
echo "[5/5] Configuring nginx..."
sudo tee /etc/nginx/sites-available/vidlode << 'EOF'
server {
    listen 80;
    server_name yt-dlp.vidlode.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
        proxy_connect_timeout 10s;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/vidlode /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

echo "
echo "=== Setup Complete ==="
echo "Next steps:"
echo "1. Point yt-dlp.vidlode.com DNS A record to this server IP"
echo "2. Run: sudo certbot --nginx -d yt-dlp.vidlode.com"
echo "3. Check: sudo systemctl status vidlode"
echo "4. Test: curl http://localhost:8080/health"
