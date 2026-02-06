#!/bin/bash
# GET BACKEND LOGS NOW - Run this on server

echo "=========================================="
echo "🔍 GETTING BACKEND CRASH LOGS"
echo "=========================================="
echo ""

# Get container status
echo "1. Container Status:"
docker ps -a | grep tvs-backend
echo ""

# Get last 100 lines of logs
echo "2. Backend Logs (Last 100 lines):"
echo "-----------------------------------"
docker logs tvs-backend --tail 100
echo ""

# Get last 20 lines with timestamps
echo "3. Recent Logs with Timestamps:"
echo "-----------------------------------"
docker logs tvs-backend --tail 20 --timestamps
echo ""

# Check if container is restarting
echo "4. Container Restart Count:"
docker inspect tvs-backend --format='{{.RestartCount}}'
echo ""

# Get exit code
echo "5. Last Exit Code:"
docker inspect tvs-backend --format='{{.State.ExitCode}}'
echo ""

# Check health
echo "6. Health Status:"
docker inspect tvs-backend --format='{{json .State.Health}}' 2>/dev/null || echo "No health check data"
echo ""

echo "=========================================="
echo "📋 COPY ALL OUTPUT ABOVE"
echo "=========================================="
