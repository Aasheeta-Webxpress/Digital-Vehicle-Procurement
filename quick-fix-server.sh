#!/bin/bash
# ========================================
# QUICK FIX - Restart Deployment
# Run this on your server: 143.110.191.22
# ========================================

echo "🚀 Quick Fix: Restarting Digital Vehicle Procurement"
echo "========================================="
echo ""

# Navigate to deployment directory
echo "📁 Navigating to deployment directory..."
cd /opt/digital-procurement || {
    echo "❌ ERROR: Directory /opt/digital-procurement not found!"
    echo "   Please create it first or check your deployment path."
    exit 1
}

echo "✅ Directory found"
echo ""

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker compose -f docker-compose.prod.yml down
echo ""

# Pull latest images
echo "📥 Pulling latest images from registry..."
docker compose -f docker-compose.prod.yml pull
echo ""

# Start containers
echo "🚀 Starting containers..."
docker compose -f docker-compose.prod.yml up -d
echo ""

# Wait for containers to start
echo "⏳ Waiting for containers to start (10 seconds)..."
sleep 10
echo ""

# Check status
echo "📊 Container Status:"
echo "-------------------------------------------"
docker compose -f docker-compose.prod.yml ps
echo ""

# Check if containers are running
FRONTEND_RUNNING=$(docker ps --filter "name=tvs-frontend" --format "{{.Names}}")
BACKEND_RUNNING=$(docker ps --filter "name=tvs-backend" --format "{{.Names}}")

if [ -n "$FRONTEND_RUNNING" ]; then
    echo "✅ Frontend container is running"
else
    echo "❌ Frontend container is NOT running"
    echo "   Checking logs..."
    docker logs --tail 20 tvs-frontend
fi

if [ -n "$BACKEND_RUNNING" ]; then
    echo "✅ Backend container is running"
else
    echo "❌ Backend container is NOT running"
    echo "   Checking logs..."
    docker logs --tail 20 tvs-backend
fi
echo ""

# Test connectivity
echo "🔍 Testing Connectivity:"
echo "-------------------------------------------"
echo "Testing frontend (localhost:3020)..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3020 | grep -q "200\|301\|302"; then
    echo "✅ Frontend is accessible"
else
    echo "⚠️  Frontend may not be fully ready yet"
fi

echo "Testing backend (localhost:8020)..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8020/health | grep -q "200"; then
    echo "✅ Backend is accessible"
else
    echo "⚠️  Backend may not be fully ready yet"
fi
echo ""

# Check firewall
echo "🔥 Checking Firewall:"
echo "-------------------------------------------"
if command -v ufw &> /dev/null; then
    UFW_3020=$(sudo ufw status | grep 3020 || echo "")
    UFW_8020=$(sudo ufw status | grep 8020 || echo "")
    
    if [ -z "$UFW_3020" ]; then
        echo "⚠️  Port 3020 not in firewall rules"
        echo "   Run: sudo ufw allow 3020/tcp"
    else
        echo "✅ Port 3020 is allowed"
    fi
    
    if [ -z "$UFW_8020" ]; then
        echo "⚠️  Port 8020 not in firewall rules"
        echo "   Run: sudo ufw allow 8020/tcp"
    else
        echo "✅ Port 8020 is allowed"
    fi
else
    echo "ℹ️  UFW not found, skipping firewall check"
fi
echo ""

echo "========================================="
echo "✅ Quick Fix Complete!"
echo "========================================="
echo ""
echo "🌐 Your application should be accessible at:"
echo "   Frontend: http://143.110.191.22:3020"
echo "   Backend:  http://143.110.191.22:8020"
echo ""
echo "📋 Next Steps:"
echo "   1. Wait 30 seconds for containers to fully start"
echo "   2. Try accessing the URLs above"
echo "   3. If still not working, check logs:"
echo "      docker logs -f tvs-frontend"
echo "      docker logs -f tvs-backend"
echo ""
echo "🆘 If issues persist, run full diagnostics:"
echo "   ./server-diagnostics.sh"
echo "========================================="
