#!/bin/bash
# ========================================
# CONTAINER MONITOR & AUTO-RESTART
# Monitors containers and restarts if stopped
# Run this as a cron job or systemd service
# ========================================

LOG_FILE="/var/log/tvs-monitor.log"
COMPOSE_DIR="/opt/digital-procurement"
COMPOSE_FILE="docker-compose.prod.yml"

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to check if container is running
is_container_running() {
    local container_name=$1
    docker ps --filter "name=$container_name" --format "{{.Names}}" | grep -q "$container_name"
}

# Function to restart containers
restart_containers() {
    log_message "🔄 Restarting containers..."
    cd "$COMPOSE_DIR" || exit 1
    docker compose -f "$COMPOSE_FILE" up -d
    log_message "✅ Restart command executed"
}

# Function to send alert (optional - configure with your notification service)
send_alert() {
    local message=$1
    # Example: Send to webhook, email, or Slack
    # curl -X POST https://your-webhook-url -d "message=$message"
    log_message "🚨 ALERT: $message"
}

# Main monitoring logic
log_message "🔍 Starting container health check..."

FRONTEND_RUNNING=$(is_container_running "tvs-frontend" && echo "yes" || echo "no")
BACKEND_RUNNING=$(is_container_running "tvs-backend" && echo "yes" || echo "no")

if [ "$FRONTEND_RUNNING" = "no" ] || [ "$BACKEND_RUNNING" = "no" ]; then
    log_message "❌ Container(s) not running!"
    log_message "   Frontend: $FRONTEND_RUNNING"
    log_message "   Backend: $BACKEND_RUNNING"
    
    # Get exit reason
    if [ "$FRONTEND_RUNNING" = "no" ]; then
        FRONTEND_STATUS=$(docker ps -a --filter "name=tvs-frontend" --format "{{.Status}}")
        log_message "   Frontend status: $FRONTEND_STATUS"
        send_alert "Frontend container stopped: $FRONTEND_STATUS"
    fi
    
    if [ "$BACKEND_RUNNING" = "no" ]; then
        BACKEND_STATUS=$(docker ps -a --filter "name=tvs-backend" --format "{{.Status}}")
        log_message "   Backend status: $BACKEND_STATUS"
        send_alert "Backend container stopped: $BACKEND_STATUS"
    fi
    
    # Restart containers
    restart_containers
    
    # Wait and verify
    sleep 10
    
    FRONTEND_RUNNING=$(is_container_running "tvs-frontend" && echo "yes" || echo "no")
    BACKEND_RUNNING=$(is_container_running "tvs-backend" && echo "yes" || echo "no")
    
    if [ "$FRONTEND_RUNNING" = "yes" ] && [ "$BACKEND_RUNNING" = "yes" ]; then
        log_message "✅ All containers restarted successfully"
        send_alert "Containers auto-restarted successfully"
    else
        log_message "❌ Failed to restart containers!"
        send_alert "CRITICAL: Failed to restart containers after crash"
    fi
else
    log_message "✅ All containers running normally"
fi

# Check container health
log_message "🏥 Checking container health..."

# Check frontend health
if curl -sf http://localhost:3020 > /dev/null; then
    log_message "✅ Frontend responding"
else
    log_message "⚠️  Frontend not responding to HTTP requests"
fi

# Check backend health
BACKEND_HEALTH=$(curl -sf http://localhost:8020/health 2>&1)
if echo "$BACKEND_HEALTH" | grep -q "healthy"; then
    log_message "✅ Backend healthy"
else
    log_message "⚠️  Backend health check failed"
    log_message "   Response: $BACKEND_HEALTH"
fi

log_message "✅ Health check complete"
echo "---" >> "$LOG_FILE"
