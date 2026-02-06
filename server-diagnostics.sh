#!/bin/bash
# ========================================
# SERVER DIAGNOSTIC SCRIPT
# Run this on your server: 143.110.191.22
# ========================================

echo "========================================="
echo "🔍 Digital Vehicle Procurement - Server Diagnostics"
echo "========================================="
echo ""

# 1. Check Docker Status
echo "1️⃣ Checking Docker Status..."
echo "-------------------------------------------"
if systemctl is-active --quiet docker; then
    echo "✅ Docker is running"
    docker --version
else
    echo "❌ Docker is NOT running"
    echo "   Fix: sudo systemctl start docker"
fi
echo ""

# 2. Check if deployment directory exists
echo "2️⃣ Checking Deployment Directory..."
echo "-------------------------------------------"
if [ -d "/opt/digital-procurement" ]; then
    echo "✅ Directory exists: /opt/digital-procurement"
    ls -la /opt/digital-procurement
else
    echo "❌ Directory NOT found: /opt/digital-procurement"
    echo "   Fix: Create directory and deploy files"
fi
echo ""

# 3. Check Docker Containers
echo "3️⃣ Checking Docker Containers..."
echo "-------------------------------------------"
echo "All containers:"
docker ps -a
echo ""
echo "Running containers only:"
docker ps
echo ""

# 4. Check specific containers
echo "4️⃣ Checking TVS Containers..."
echo "-------------------------------------------"
FRONTEND_STATUS=$(docker ps -a --filter "name=tvs-frontend" --format "{{.Status}}")
BACKEND_STATUS=$(docker ps -a --filter "name=tvs-backend" --format "{{.Status}}")

if [ -n "$FRONTEND_STATUS" ]; then
    echo "Frontend Container: $FRONTEND_STATUS"
else
    echo "❌ Frontend container NOT found"
fi

if [ -n "$BACKEND_STATUS" ]; then
    echo "Backend Container: $BACKEND_STATUS"
else
    echo "❌ Backend container NOT found"
fi
echo ""

# 5. Check Port Bindings
echo "5️⃣ Checking Port Bindings..."
echo "-------------------------------------------"
echo "Ports 3020 and 8020:"
netstat -tlnp | grep -E ':(3020|8020)' || echo "❌ No services listening on ports 3020/8020"
echo ""

# 6. Check Firewall
echo "6️⃣ Checking Firewall (UFW)..."
echo "-------------------------------------------"
if command -v ufw &> /dev/null; then
    sudo ufw status
    echo ""
    echo "Checking if ports 3020/8020 are allowed:"
    sudo ufw status | grep -E '(3020|8020)' || echo "⚠️  Ports may not be allowed in firewall"
else
    echo "UFW not installed or not in use"
fi
echo ""

# 7. Check Container Logs
echo "7️⃣ Checking Container Logs (last 20 lines)..."
echo "-------------------------------------------"
echo "Frontend logs:"
docker logs --tail 20 tvs-frontend 2>&1 || echo "❌ Cannot get frontend logs"
echo ""
echo "Backend logs:"
docker logs --tail 20 tvs-backend 2>&1 || echo "❌ Cannot get backend logs"
echo ""

# 8. Check Docker Compose Status
echo "8️⃣ Checking Docker Compose Status..."
echo "-------------------------------------------"
cd /opt/digital-procurement 2>/dev/null
if [ -f "docker-compose.prod.yml" ]; then
    echo "✅ docker-compose.prod.yml exists"
    docker compose -f docker-compose.prod.yml ps
else
    echo "❌ docker-compose.prod.yml NOT found"
fi
echo ""

# 9. Check System Resources
echo "9️⃣ Checking System Resources..."
echo "-------------------------------------------"
echo "Memory Usage:"
free -h
echo ""
echo "Disk Usage:"
df -h /
echo ""
echo "CPU Load:"
uptime
echo ""

# 10. Check Network Connectivity
echo "🔟 Checking Network Connectivity..."
echo "-------------------------------------------"
echo "Testing localhost:3020..."
curl -I http://localhost:3020 2>&1 | head -5 || echo "❌ Cannot connect to localhost:3020"
echo ""
echo "Testing localhost:8020..."
curl -I http://localhost:8020 2>&1 | head -5 || echo "❌ Cannot connect to localhost:8020"
echo ""

echo "========================================="
echo "✅ Diagnostic Complete!"
echo "========================================="
echo ""
echo "📋 QUICK FIXES:"
echo "-------------------------------------------"
echo "If containers are stopped:"
echo "  cd /opt/digital-procurement"
echo "  docker compose -f docker-compose.prod.yml up -d"
echo ""
echo "If containers don't exist:"
echo "  cd /opt/digital-procurement"
echo "  docker compose -f docker-compose.prod.yml pull"
echo "  docker compose -f docker-compose.prod.yml up -d"
echo ""
echo "If firewall blocking:"
echo "  sudo ufw allow 3020/tcp"
echo "  sudo ufw allow 8020/tcp"
echo ""
echo "View live logs:"
echo "  docker logs -f tvs-frontend"
echo "  docker logs -f tvs-backend"
echo "========================================="
