# ✅ Deployment Verification Guide

## Current Status

Your GitHub Actions deployment completed successfully! 🎉

**Deployment Time:** Just now (37 seconds ago)  
**Status:** ✅ Deployment Complete  
**URLs:**
- Frontend: http://143.110.191.22:3020
- Backend: http://143.110.191.22:8020

---

## Quick Verification Steps

### 1. Test Frontend Access

Open in browser:
```
http://143.110.191.22:3020
```

**Expected:** You should see the Digital Vehicle Procurement application UI

### 2. Test Backend Health

Open in browser or use curl:
```bash
curl http://143.110.191.22:8020/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "firebase_connected": true,
  "environment": "production"
}
```

### 3. Test Authentication Endpoints

**Check if auth endpoints are accessible:**
```bash
curl http://143.110.191.22:8020/api/auth/register -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"test@example.com","password":"Test@1234","userType":"Customer","mobileNo":"9876543210","companyCode":10065}'
```

### 4. Verify Containers on Server

SSH into server and check:
```bash
ssh root@143.110.191.22
docker ps
```

**Expected Output:**
```
CONTAINER ID   IMAGE                                                              STATUS         PORTS
abc123...      ghcr.io/aasheeta-webxpress/digital-vehicle-procurement/frontend   Up X minutes   0.0.0.0:3020->80/tcp
def456...      ghcr.io/aasheeta-webxpress/digital-vehicle-procurement/backend    Up X minutes   0.0.0.0:8020->8000/tcp
```

---

## If Still Not Accessible

### Wait a Moment
Containers may need 30-60 seconds to fully start after deployment.

### Check Container Logs
```bash
ssh root@143.110.191.22
cd /opt/digital-procurement
docker logs tvs-frontend
docker logs tvs-backend
```

### Verify Firewall
```bash
sudo ufw status | grep -E '(3020|8020)'
```

If ports not allowed:
```bash
sudo ufw allow 3020/tcp
sudo ufw allow 8020/tcp
```

### Force Restart (if needed)
```bash
cd /opt/digital-procurement
docker compose -f docker-compose.prod.yml restart
```

---

## Testing the New Authentication System

Once the application is accessible, you can test the Firebase Authentication:

### 1. Register a Customer
```bash
curl -X POST http://143.110.191.22:8020/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "customer@example.com",
    "password": "Customer@123",
    "userType": "Customer",
    "mobileNo": "9876543210",
    "companyCode": 10065
  }'
```

### 2. Login
```bash
curl -X POST http://143.110.191.22:8020/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "customer@example.com",
    "password": "Customer@123"
  }'
```

### 3. Access API Documentation
```
http://143.110.191.22:8020/docs
```

---

## Monitoring

### View Live Logs
```bash
# Frontend logs
docker logs -f tvs-frontend

# Backend logs
docker logs -f tvs-backend

# Both together
docker compose -f docker-compose.prod.yml logs -f
```

### Check Container Health
```bash
docker compose -f docker-compose.prod.yml ps
```

---

## Success Indicators

✅ Frontend loads in browser  
✅ Backend health endpoint returns 200  
✅ API docs accessible at `/docs`  
✅ Containers show "Up" status  
✅ No errors in container logs  

---

## Next Steps

1. **Test the application** - Try accessing both URLs
2. **Wait 1-2 minutes** if not immediately accessible
3. **Check firewall** if connection refused
4. **Review logs** if containers crash
5. **Test authentication** once accessible

The deployment succeeded, so the application should be running now! 🚀
