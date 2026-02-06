# 🚀 Production Deployment Guide - Server 143.110.191.22

## 📋 Deployment Overview

**Server**: http://143.110.191.22  
**OS**: Ubuntu/Linux (assumed)  
**Architecture**: Frontend + Backend + Firebase

### Port Allocation

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| **Frontend** | 3000 | http://143.110.191.22:3000 | React App (Production Build) |
| **Backend** | 8000 | http://143.110.191.22:8000 | FastAPI Server |
| **Nginx** | 80 | http://143.110.191.22 | Reverse Proxy (Optional) |

---

## 🏗️ Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Server: 143.110.191.22                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Nginx (Port 80) - Optional              │  │
│  │              Reverse Proxy & SSL                     │  │
│  └────────────┬─────────────────────────┬────────────────┘  │
│               │                         │                   │
│               ▼                         ▼                   │
│  ┌────────────────────────┐  ┌─────────────────────────┐  │
│  │   Frontend (Port 3000) │  │  Backend (Port 8000)    │  │
│  │   React + Vite         │  │  FastAPI + Uvicorn      │  │
│  │   Served by serve/PM2  │  │  Managed by PM2         │  │
│  └────────────────────────┘  └───────────┬─────────────┘  │
│                                           │                 │
│                                           ▼                 │
│                              ┌────────────────────────┐    │
│                              │  Firebase Credentials  │    │
│                              │  serviceAccountKey.json│    │
│                              └────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Firebase Cloud (External)   │
                    │   - Firestore Database        │
                    │   - Authentication            │
                    │   - Project: controltower-1099│
                    └───────────────────────────────┘
```

---

## 🔧 Prerequisites

### On Your Local Machine:
- ✅ Git installed
- ✅ SSH access to server
- ✅ GitHub account (for CI/CD)

### On Server (143.110.191.22):
- Ubuntu 20.04+ or similar Linux
- Root or sudo access
- Internet connection

---

## 📦 Step 1: Server Initial Setup

### 1.1 Connect to Server

```bash
# SSH into your server
ssh root@143.110.191.22
# or
ssh your-username@143.110.191.22
```

### 1.2 Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.3 Install Required Software

```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python 3.12
sudo apt install -y software-properties-common
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt update
sudo apt install -y python3.12 python3.12-venv python3.12-dev

# Install Git
sudo apt install -y git

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install build essentials
sudo apt install -y build-essential

# Install Nginx (optional, for reverse proxy)
sudo apt install -y nginx
```

### 1.4 Check Available Ports

```bash
# Check what ports are in use
sudo netstat -tulpn | grep LISTEN

# Check if ports 3000 and 8000 are free
sudo lsof -i :3000
sudo lsof -i :8000

# If ports are in use, choose different ones
```

---

## 📂 Step 2: Deploy Application

### 2.1 Clone Repository

```bash
# Create application directory
sudo mkdir -p /var/www
cd /var/www

# Clone your repository
sudo git clone https://github.com/YOUR-USERNAME/Digital-Vehicle-Procurement.git
cd Digital-Vehicle-Procurement

# Set permissions
sudo chown -R $USER:$USER /var/www/Digital-Vehicle-Procurement
```

### 2.2 Setup Backend

```bash
cd /var/www/Digital-Vehicle-Procurement/backend

# Create virtual environment with Python 3.12
python3.12 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Upload Firebase credentials
# Option 1: Using SCP from local machine
# scp backend/serviceAccountKey.json root@143.110.191.22:/var/www/Digital-Vehicle-Procurement/backend/

# Option 2: Create file manually
nano serviceAccountKey.json
# Paste your Firebase credentials, save (Ctrl+X, Y, Enter)

# Create production .env file
cp .env.example .env
nano .env
```

**Edit .env file:**
```env
# Firebase Configuration
FIREBASE_CREDENTIALS_PATH=./serviceAccountKey.json
FIREBASE_PROJECT_ID=controltower-1099

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=False  # Set to False for production

# CORS Configuration
CORS_ORIGINS=http://143.110.191.22:3000,http://143.110.191.22

# Environment
ENVIRONMENT=production
DEBUG=False  # Set to False for production

# Optional: Gemini API Key
GEMINI_API_KEY=your-gemini-api-key
```

### 2.3 Setup Frontend

```bash
cd /var/www/Digital-Vehicle-Procurement

# Install dependencies
npm install

# Create production environment file
cp .env.example .env.production
nano .env.production
```

**Edit .env.production:**
```env
VITE_API_URL=http://143.110.191.22:8000/api/v1
VITE_GEMINI_API_KEY=your-gemini-api-key
```

**Update services.ts for production:**
```bash
nano services.ts
```

Change:
```typescript
const USE_MOCK_MODE = false;  // Use backend API in production
```

**Build frontend:**
```bash
npm run build

# Install serve globally (to serve static files)
sudo npm install -g serve
```

---

## 🚀 Step 3: Start Services with PM2

### 3.1 Start Backend

```bash
cd /var/www/Digital-Vehicle-Procurement/backend

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'tvs-backend',
    script: 'venv/bin/uvicorn',
    args: 'app.main:app --host 0.0.0.0 --port 8000',
    cwd: '/var/www/Digital-Vehicle-Procurement/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF

# Start backend with PM2
pm2 start ecosystem.config.js

# Check status
pm2 status
pm2 logs tvs-backend
```

### 3.2 Start Frontend

```bash
cd /var/www/Digital-Vehicle-Procurement

# Create PM2 config for frontend
cat > ecosystem.frontend.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'tvs-frontend',
    script: 'serve',
    args: '-s dist -l 3000',
    cwd: '/var/www/Digital-Vehicle-Procurement',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF

# Start frontend with PM2
pm2 start ecosystem.frontend.config.js

# Check status
pm2 status
pm2 logs tvs-frontend
```

### 3.3 Save PM2 Configuration

```bash
# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the command it gives you (usually starts with sudo)

# Verify both services are running
pm2 list
```

---

## 🔥 Step 4: Configure Firewall

```bash
# Allow ports 3000 and 8000
sudo ufw allow 3000/tcp
sudo ufw allow 8000/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp  # SSH

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## 🌐 Step 5: Setup Nginx Reverse Proxy (Optional but Recommended)

### 5.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/tvs-procurement
```

**Add this configuration:**
```nginx
# Frontend - Main domain
server {
    listen 80;
    server_name 143.110.191.22;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend docs
    location /docs {
        proxy_pass http://localhost:8000/docs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:8000/health;
    }
}
```

### 5.2 Enable Nginx Configuration

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/tvs-procurement /etc/nginx/sites-enabled/

# Remove default config
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx
```

---

## ✅ Step 6: Verify Deployment

### 6.1 Check Services

```bash
# Check PM2 processes
pm2 list
pm2 logs

# Check Nginx
sudo systemctl status nginx

# Check ports
sudo netstat -tulpn | grep -E ':(3000|8000|80)'
```

### 6.2 Test URLs

**Without Nginx:**
- Frontend: http://143.110.191.22:3000
- Backend API: http://143.110.191.22:8000/docs
- Health Check: http://143.110.191.22:8000/health

**With Nginx:**
- Frontend: http://143.110.191.22
- Backend API: http://143.110.191.22/api/v1/indents
- API Docs: http://143.110.191.22/docs
- Health Check: http://143.110.191.22/health

### 6.3 Test from Browser

```bash
# Test backend health
curl http://143.110.191.22:8000/health

# Test backend API
curl http://143.110.191.22:8000/api/v1/indents

# Test frontend (should return HTML)
curl http://143.110.191.22:3000
```

---

## 🔄 Step 7: Setup Auto-Deployment (CI/CD)

See `DEPLOYMENT_CICD.md` for complete GitHub Actions setup.

---

## 📊 Monitoring & Maintenance

### View Logs

```bash
# PM2 logs
pm2 logs tvs-backend
pm2 logs tvs-frontend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
journalctl -u nginx -f
```

### Restart Services

```bash
# Restart backend
pm2 restart tvs-backend

# Restart frontend
pm2 restart tvs-frontend

# Restart Nginx
sudo systemctl restart nginx

# Restart all PM2 processes
pm2 restart all
```

### Update Application

```bash
cd /var/www/Digital-Vehicle-Procurement

# Pull latest code
git pull origin main

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
pm2 restart tvs-backend

# Update frontend
cd ..
npm install
npm run build
pm2 restart tvs-frontend
```

---

## 🔒 Security Checklist

- ✅ Firewall configured (UFW)
- ✅ SSH key authentication enabled
- ✅ Root login disabled
- ✅ Environment variables secured
- ✅ Firebase credentials protected
- ✅ HTTPS/SSL configured (optional, see SSL guide)
- ✅ Regular backups scheduled

---

## 🆘 Troubleshooting

### Backend not starting?

```bash
# Check logs
pm2 logs tvs-backend --lines 100

# Check if port is in use
sudo lsof -i :8000

# Test manually
cd /var/www/Digital-Vehicle-Procurement/backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend not loading?

```bash
# Check logs
pm2 logs tvs-frontend --lines 100

# Rebuild
cd /var/www/Digital-Vehicle-Procurement
npm run build
pm2 restart tvs-frontend
```

### Nginx errors?

```bash
# Check configuration
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log

# Restart
sudo systemctl restart nginx
```

---

## 📝 Quick Commands Reference

```bash
# View all services
pm2 list

# View logs
pm2 logs

# Restart service
pm2 restart tvs-backend
pm2 restart tvs-frontend

# Stop service
pm2 stop tvs-backend
pm2 stop tvs-frontend

# Delete service
pm2 delete tvs-backend
pm2 delete tvs-frontend

# Save PM2 configuration
pm2 save

# Check Nginx status
sudo systemctl status nginx

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🎯 Deployment Checklist

- [ ] Server access confirmed
- [ ] Node.js 18+ installed
- [ ] Python 3.12 installed
- [ ] PM2 installed
- [ ] Repository cloned
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Firebase credentials uploaded
- [ ] Environment files configured
- [ ] Frontend built
- [ ] Backend started with PM2
- [ ] Frontend started with PM2
- [ ] Firewall configured
- [ ] Nginx configured (optional)
- [ ] Services accessible from browser
- [ ] PM2 startup configured
- [ ] Monitoring setup

---

**Deployment Status**: 🚀 Ready to Deploy!

**Next**: See `DEPLOYMENT_CICD.md` for automated deployment setup.
