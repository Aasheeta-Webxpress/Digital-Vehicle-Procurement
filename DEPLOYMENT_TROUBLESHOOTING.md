# 🚨 URGENT: Server Connection Issues - Troubleshooting Guide

## Problem
Your deployed application at `http://143.110.191.22:3020` (frontend) and `http://143.110.191.22:8020` (backend) is showing **ERR_CONNECTION_REFUSED**.

## Most Likely Causes

### 1. 🐳 Docker Containers Stopped/Crashed
**Symptoms:** Connection refused on both ports  
**Probability:** ⭐⭐⭐⭐⭐ (Very High)

**Quick Fix:**
```bash
# SSH into your server
ssh root@143.110.191.22

# Navigate to deployment directory
cd /opt/digital-procurement

# Check container status
docker compose -f docker-compose.prod.yml ps

# If containers are stopped, restart them
docker compose -f docker-compose.prod.yml up -d

# Check logs
docker logs tvs-frontend
docker logs tvs-backend
```

### 2. 🔥 Firewall Blocking Ports
**Symptoms:** Containers running but not accessible  
**Probability:** ⭐⭐⭐⭐ (High)

**Quick Fix:**
```bash
# Check firewall status
sudo ufw status

# Allow ports if blocked
sudo ufw allow 3020/tcp
sudo ufw allow 8020/tcp

# Reload firewall
sudo ufw reload
```

### 3. 💾 Server Out of Resources
**Symptoms:** Containers crash repeatedly  
**Probability:** ⭐⭐⭐ (Medium)

**Quick Fix:**
```bash
# Check memory
free -h

# Check disk space
df -h

# Check Docker resource usage
docker stats --no-stream

# If low on resources, clean up
docker system prune -a
```

### 4. 🔧 Docker Daemon Not Running
**Symptoms:** Cannot connect to Docker  
**Probability:** ⭐⭐ (Low)

**Quick Fix:**
```bash
# Check Docker status
sudo systemctl status docker

# Start Docker if stopped
sudo systemctl start docker
sudo systemctl enable docker
```

---

## 🎯 Step-by-Step Troubleshooting

### Step 1: Run Diagnostic Script

**Option A - Copy and run the diagnostic script:**
```bash
# SSH into server
ssh root@143.110.191.22

# Download diagnostic script
curl -o diagnose.sh https://raw.githubusercontent.com/Aasheeta-Webxpress/Digital-Vehicle-Procurement/main/server-diagnostics.sh

# Make executable
chmod +x diagnose.sh

# Run diagnostics
./diagnose.sh
```

**Option B - Manual commands:**
```bash
# SSH into server
ssh root@143.110.191.22

# Check if Docker is running
systemctl status docker

# Check containers
docker ps -a

# Check specific containers
docker ps -a | grep tvs

# Check ports
netstat -tlnp | grep -E ':(3020|8020)'
```

### Step 2: Restart Containers

```bash
cd /opt/digital-procurement

# Stop containers
docker compose -f docker-compose.prod.yml down

# Pull latest images
docker compose -f docker-compose.prod.yml pull

# Start containers
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

### Step 3: Check Firewall

```bash
# Check UFW status
sudo ufw status verbose

# If ports are not allowed, add them
sudo ufw allow 3020/tcp comment 'TVS Frontend'
sudo ufw allow 8020/tcp comment 'TVS Backend'

# Reload firewall
sudo ufw reload

# Verify
sudo ufw status | grep -E '(3020|8020)'
```

### Step 4: Verify Deployment Files

```bash
cd /opt/digital-procurement

# Check if files exist
ls -la

# Verify docker-compose.prod.yml
cat docker-compose.prod.yml

# Check if .env file exists
ls -la .env

# Check Firebase credentials
ls -la firebase-credentials.json
```

### Step 5: Test Local Connectivity

```bash
# Test from server itself
curl http://localhost:3020
curl http://localhost:8020/health

# Test from external IP
curl http://143.110.191.22:3020
curl http://143.110.191.22:8020/health
```

---

## 🔍 Common Issues & Solutions

### Issue: "Cannot connect to Docker daemon"
```bash
sudo systemctl start docker
sudo systemctl enable docker
```

### Issue: "No such file or directory: /opt/digital-procurement"
```bash
# Create directory
sudo mkdir -p /opt/digital-procurement
cd /opt/digital-procurement

# Clone repository or copy files
git clone https://github.com/Aasheeta-Webxpress/Digital-Vehicle-Procurement.git .

# Or manually copy docker-compose.prod.yml and .env
```

### Issue: "Container exits immediately"
```bash
# Check logs for errors
docker logs tvs-frontend
docker logs tvs-backend

# Common causes:
# - Missing environment variables
# - Missing Firebase credentials
# - Port already in use
```

### Issue: "Port already in use"
```bash
# Find process using port
sudo lsof -i :3020
sudo lsof -i :8020

# Kill process if needed
sudo kill -9 <PID>

# Or use different ports in docker-compose.prod.yml
```

---

## 🚀 Quick Recovery Commands

**Complete restart:**
```bash
ssh root@143.110.191.22
cd /opt/digital-procurement
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml logs -f
```

**Force rebuild:**
```bash
cd /opt/digital-procurement
docker compose -f docker-compose.prod.yml down -v
docker system prune -a -f
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --force-recreate
```

**Check health:**
```bash
# Container status
docker compose -f docker-compose.prod.yml ps

# Container health
docker inspect tvs-frontend | grep -A 10 Health
docker inspect tvs-backend | grep -A 10 Health

# Live logs
docker logs -f --tail 100 tvs-frontend
docker logs -f --tail 100 tvs-backend
```

---

## 📊 Expected Output When Working

**Container Status:**
```
NAME            STATUS          PORTS
tvs-frontend    Up 2 hours      0.0.0.0:3020->80/tcp
tvs-backend     Up 2 hours      0.0.0.0:8020->8000/tcp
```

**Port Check:**
```
tcp    0.0.0.0:3020    0.0.0.0:*    LISTEN    1234/docker-proxy
tcp    0.0.0.0:8020    0.0.0.0:*    LISTEN    5678/docker-proxy
```

**Health Check:**
```bash
curl http://localhost:8020/health
# Should return: {"status":"healthy","firebase_connected":true}
```

---

## 🆘 If Nothing Works

1. **Check GitHub Actions logs** - See if deployment actually succeeded
2. **Verify server SSH access** - Make sure you can connect
3. **Check server provider dashboard** - Verify server is running
4. **Review security groups** - Ensure ports 3020/8020 are open in cloud provider
5. **Check DNS/IP** - Verify 143.110.191.22 is correct server IP

---

## 📞 Next Steps

1. **SSH into your server** and run the diagnostic script
2. **Share the output** so we can identify the exact issue
3. **Check container logs** for specific error messages
4. **Verify firewall settings** in your cloud provider dashboard

---

## 🔑 Required Information

To help further, please provide:
- [ ] Output of `docker ps -a`
- [ ] Output of `docker logs tvs-frontend`
- [ ] Output of `docker logs tvs-backend`
- [ ] Output of `sudo ufw status`
- [ ] Cloud provider (DigitalOcean, AWS, etc.)
