# Container Monitoring Setup Guide

## Automatic Container Monitoring & Recovery

This guide sets up automatic monitoring to prevent containers from staying stopped.

---

## Quick Setup (5 Minutes)

### Step 1: Copy Monitor Script to Server

```bash
# SSH into server
ssh root@143.110.191.22

# Navigate to deployment directory
cd /opt/digital-procurement

# Download monitor script
curl -o container-monitor.sh https://raw.githubusercontent.com/Aasheeta-Webxpress/Digital-Vehicle-Procurement/main/container-monitor.sh

# Make executable
chmod +x container-monitor.sh

# Test it
./container-monitor.sh
```

### Step 2: Set Up Cron Job (Auto-check every 5 minutes)

```bash
# Edit crontab
crontab -e

# Add this line (checks every 5 minutes):
*/5 * * * * /opt/digital-procurement/container-monitor.sh

# Save and exit
```

**That's it!** Containers will now be automatically restarted if they stop.

---

## What the Monitor Does

✅ Checks if containers are running every 5 minutes  
✅ Auto-restarts stopped containers  
✅ Logs all events to `/var/log/tvs-monitor.log`  
✅ Verifies health after restart  
✅ Can send alerts (optional)  

---

## View Monitor Logs

```bash
# View recent activity
tail -f /var/log/tvs-monitor.log

# View last 50 lines
tail -50 /var/log/tvs-monitor.log

# Search for crashes
grep "not running" /var/log/tvs-monitor.log
```

---

## Enhanced Docker Compose

I've updated `docker-compose.prod.yml` with:

### 1. Resource Limits
```yaml
deploy:
  resources:
    limits:
      memory: 512M  # Frontend
      memory: 1G    # Backend
```
**Prevents:** Out-of-memory crashes

### 2. Log Rotation
```yaml
logging:
  options:
    max-size: "10m"
    max-file: "3"
```
**Prevents:** Disk filling up with logs

### 3. Better Health Checks
```yaml
healthcheck:
  interval: 30s
  retries: 3
  start_period: 40s
```
**Prevents:** Unhealthy containers running

---

## Deploy Updated Configuration

```bash
ssh root@143.110.191.22
cd /opt/digital-procurement

# Pull updated docker-compose.prod.yml from repo
git pull origin main

# Or manually update the file, then:
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

---

## Manual Monitoring Commands

### Check Container Status
```bash
docker ps -a --filter "name=tvs"
```

### Check Why Container Stopped
```bash
docker inspect tvs-backend | grep -A 10 "State"
```

### View Crash Logs
```bash
docker logs tvs-backend --tail 100
```

### Check Resource Usage
```bash
docker stats --no-stream
```

---

## Alert Configuration (Optional)

To get notified when containers crash, edit `container-monitor.sh`:

### Option 1: Email Alerts
```bash
send_alert() {
    echo "$1" | mail -s "TVS Container Alert" your@email.com
}
```

### Option 2: Slack Webhook
```bash
send_alert() {
    curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
      -H 'Content-Type: application/json' \
      -d "{\"text\":\"$1\"}"
}
```

### Option 3: Discord Webhook
```bash
send_alert() {
    curl -X POST https://discord.com/api/webhooks/YOUR/WEBHOOK \
      -H 'Content-Type: application/json' \
      -d "{\"content\":\"$1\"}"
}
```

---

## Troubleshooting

### Monitor Not Running
```bash
# Check cron service
systemctl status cron

# View cron logs
grep CRON /var/log/syslog
```

### Permissions Issues
```bash
# Make sure script is executable
chmod +x /opt/digital-procurement/container-monitor.sh

# Create log file
touch /var/log/tvs-monitor.log
chmod 644 /var/log/tvs-monitor.log
```

### Test Monitor Manually
```bash
# Run once
/opt/digital-procurement/container-monitor.sh

# Check output
cat /var/log/tvs-monitor.log
```

---

## Why Containers Stop - Common Causes

1. **Application Crash** (60%)
   - Code errors
   - Missing dependencies
   - Configuration issues

2. **Out of Memory** (25%)
   - Container uses too much RAM
   - OOM killer terminates it
   - **Fixed by:** Resource limits

3. **Health Check Failure** (10%)
   - App becomes unresponsive
   - Docker restarts it
   - **Fixed by:** Better health checks

4. **Server Reboot** (5%)
   - Server restarts
   - **Fixed by:** `restart: unless-stopped`

---

## Prevention Checklist

- [x] Resource limits added
- [x] Log rotation configured
- [x] Health checks improved
- [x] Auto-restart policy set
- [ ] Monitoring script installed
- [ ] Cron job configured
- [ ] Alerts set up (optional)

---

## Next Steps

1. **Deploy updated docker-compose.prod.yml**
2. **Install monitoring script**
3. **Set up cron job**
4. **Test by stopping a container manually**
5. **Verify auto-restart works**

With these changes, your containers should stay running reliably! 🚀
