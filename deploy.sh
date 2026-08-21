#!/bin/bash
# ZarrinPal Analytics Dashboard - Deployment Script
# Server: 62.60.198.209 (Test)
# Usage: curl -s https://raw.githubusercontent.com/Armoyas/zarrinpal-analytics/main/deploy.sh | bash
# Or with Docker: curl -s https://raw.githubusercontent.com/Armoyas/zarrinpal-analytics/main/deploy.sh | bash -s -- --docker
# Or Docker-only: ssh root@62.60.198.209 "apt-get update -qq && apt-get install -y -qq docker.io docker-compose && curl -s https://raw.githubusercontent.com/Armoyas/zarrinpal-analytics/main/deploy.sh | bash -s -- --docker"

set -e

DOCKER_MODE=false
if [ "$1" = "--docker" ]; then
    DOCKER_MODE=true
fi

echo "=== ZarrinPal Analytics Deployment ==="
echo "Mode: $([ "$DOCKER_MODE" = "true" ] && echo 'Docker' || echo 'Direct')"

# Update system
echo "Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq

# Install prerequisites (without Docker — Docker can have conflicts on some distros)
echo "Installing prerequisites..."
apt-get install -y -qq --no-install-recommends python3 python3-pip python3-venv nginx curl git unzip

# Install Docker separately (handles conflicts gracefully)
echo "Setting up Docker..."
if ! command -v docker &> /dev/null; then
    # Try docker.io first (Debian package)
    apt-get install -y -qq docker.io 2>/dev/null || {
        echo "docker.io failed, trying docker-ce..."
        curl -fsSL https://get.docker.com | sh -s -- --daemon
    }
fi

# Docker Compose (v2 built-in via docker compose, plus standalone fallback)
if ! docker compose version &> /dev/null 2>&1; then
    apt-get install -y -qq docker-compose 2>/dev/null || {
        echo "docker-compose package unavailable, using docker compose plugin"
    }
fi

# Install Node.js 20.x
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y -qq --no-install-recommends nodejs

# Start Docker
if command -v docker &> /dev/null; then
    echo "Starting Docker..."
    if command -v systemctl &> /dev/null && pidof systemd &> /dev/null; then
        systemctl start docker
    elif [ -S /var/run/docker.sock ]; then
        echo "Docker daemon already running"
    else
        (dockerd &) || (service docker start) || echo "Docker may already be running"
    fi
    usermod -aG docker root 2>/dev/null || true
fi

# Create app directory
echo "Setting up application directory..."
mkdir -p /var/www/zarrinpal
cd /var/www/zarrinpal

# Clone/update repository (using credential helper or token from .env)
# This script can be run directly on the server after git config credential setup
if [ -d ".git" ]; then
    echo "Updating existing repository..."
    git pull origin main
else
    echo "Cloning repository..."
    git clone https://github.com/Armoyas/zarrinpal-analytics.git .
fi

# Setup Python environment
echo "Setting up Python environment..."
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip -q
pip install -r services/api/requirements.txt -q

# Load sample data into DuckDB
echo "Initializing database..."
cd services/api
PYTHONPATH=.:./app/db python scripts/seed_demo.py
cd /var/www/zarrinpal

# Install frontend dependencies
echo "Building frontend..."
cd frontend
npm install -q
npm run build

# Create systemd service for API
echo "Configuring services..."
cat > /etc/systemd/system/zarrinpal-api.service << 'EOF'
[Unit]
Description=ZarrinPal Analytics API
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/zarrinpal/services/api
Environment=PYTHONPATH=.:./app/db
ExecStart=/var/www/zarrinpal/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Create systemd service for frontend
cat > /etc/systemd/system/zarrinpal-frontend.service << 'EOF'
[Unit]
Description=ZarrinPal Analytics Frontend
After=network.target zarrinpal-api.service

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/zarrinpal/frontend
ExecStart=/usr/bin/npx next start -p 3000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Configure nginx
cat > /etc/nginx/sites-available/zarrinpal << 'EOF'
server {
    listen 80;
    server_name 62.60.198.209;

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/zarrinpal /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Enable and start services
systemctl daemon-reload
systemctl enable nginx
systemctl enable zarrinpal-api.service
systemctl enable zarrinpal-frontend.service

echo "Starting services..."
systemctl start nginx
systemctl start zarrinpal-api.service
systemctl start zarrinpal-frontend.service

# Wait for services to start
sleep 5

echo "=== Deployment Complete ==="
echo "API: http://62.60.198.209:8000"
echo "Dashboard: http://62.60.198.209"
echo "API Health: http://62.60.198.209/api/v1/health"

# Show service status
systemctl status zarrinpal-api.service --no-pager
systemctl status zarrinpal-frontend.service --no-pager
systemctl status nginx --no-pager