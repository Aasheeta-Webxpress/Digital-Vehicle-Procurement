#!/bin/bash
# EMERGENCY - Get Backend Crash Logs
# Run this on your server NOW

echo "🚨 EMERGENCY: Getting Backend Crash Logs"
echo "=========================================="

# Get container status
echo "1. Container Status:"
docker ps -a --filter "name=tvs-backend" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# Get last 200 lines of logs
echo "2. Backend Logs (Last 200 lines):"
echo "-----------------------------------"
docker logs tvs-backend --tail 200 2>&1
echo ""

# Check if container exists
if ! docker ps -a --filter "name=tvs-backend" --format "{{.Names}}" | grep -q "tvs-backend"; then
    echo "❌ ERROR: Container tvs-backend does not exist!"
    echo "   Checking docker-compose status..."
    cd /opt/digital-procurement
    docker compose -f docker-compose.prod.yml ps
    exit 1
fi

# Get exit code
echo "3. Container Exit Code:"
docker inspect tvs-backend --format='{{.State.ExitCode}}'
echo ""

# Check OOM
echo "4. Checking for Out-of-Memory:"
docker inspect tvs-backend --format='{{.State.OOMKilled}}'
echo ""

# Get error from State
echo "5. Container State Error:"
docker inspect tvs-backend --format='{{.State.Error}}'
echo ""

# Check health
echo "6. Health Check Status:"
docker inspect tvs-backend --format='{{json .State.Health}}' | python3 -m json.tool 2>/dev/null || echo "No health data"
echo ""

# Check if firebase credentials exist
echo "7. Checking Firebase Credentials:"
if [ -f "/opt/digital-procurement/firebase-credentials.json" ]; then
    echo "✅ firebase-credentials.json exists"
    ls -lh /opt/digital-procurement/firebase-credentials.json
else
    echo "❌ firebase-credentials.json NOT FOUND!"
fi
echo ""

# Check .env file
echo "8. Checking .env file:"
if [ -f "/opt/digital-procurement/.env" ]; then
    echo "✅ .env exists"
    cat /opt/digital-procurement/.env
else
    echo "❌ .env NOT FOUND!"
fi
echo ""

echo "=========================================="
echo "📋 SAVE THIS OUTPUT AND SHARE IT"
echo "=========================================="
