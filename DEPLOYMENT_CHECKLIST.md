# 🚀 Deployment Checklist - Server 143.110.191.22

## Pre-Deployment

### Local Machine
- [ ] Code tested locally
- [ ] Backend running successfully
- [ ] Frontend running successfully
- [ ] Firebase connected
- [ ] All secrets documented
- [ ] Git repository up to date

### Server Access
- [ ] SSH access to 143.110.191.22 confirmed
- [ ] Root or sudo privileges available
- [ ] Server OS: Ubuntu/Linux confirmed

---

## Server Setup

### System Packages
- [ ] System updated (`sudo apt update && upgrade`)
- [ ] Node.js 18+ installed
- [ ] Python 3.12 installed
- [ ] Git installed
- [ ] PM2 installed globally
- [ ] Nginx installed (optional)
- [ ] Build tools installed

### Firewall Configuration
- [ ] UFW enabled
- [ ] Port 22 (SSH) allowed
- [ ] Port 80 (HTTP) allowed
- [ ] Port 443 (HTTPS) allowed
- [ ] Port 3000 (Frontend) allowed
- [ ] Port 8000 (Backend) allowed

### Port Verification
- [ ] Port 3000 available
- [ ] Port 8000 available
- [ ] No conflicts with existing services

---

## Application Deployment

### Repository Setup
- [ ] Repository cloned to `/var/www/Digital-Vehicle-Procurement`
- [ ] Correct branch checked out (main)
- [ ] Permissions set correctly

### Backend Setup
- [ ] Virtual environment created (`python3.12 -m venv venv`)
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] `serviceAccountKey.json` uploaded
- [ ] `.env` file created from `.env.example`
- [ ] Firebase project ID configured
- [ ] Environment set to `production`
- [ ] Debug mode set to `False`

### Frontend Setup
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.production` created
- [ ] API URL configured (`VITE_API_URL`)
- [ ] `services.ts` updated (`USE_MOCK_MODE = false`)
- [ ] Production build created (`npm run build`)
- [ ] `serve` package installed globally

---

## PM2 Configuration

### Backend Service
- [ ] PM2 ecosystem file created (`ecosystem.config.js`)
- [ ] Backend started with PM2
- [ ] Service named `tvs-backend`
- [ ] Auto-restart enabled
- [ ] Logs accessible

### Frontend Service
- [ ] PM2 ecosystem file created (`ecosystem.frontend.config.js`)
- [ ] Frontend started with PM2
- [ ] Service named `tvs-frontend`
- [ ] Auto-restart enabled
- [ ] Logs accessible

### PM2 Management
- [ ] PM2 process list saved (`pm2 save`)
- [ ] PM2 startup configured (`pm2 startup`)
- [ ] Startup command executed
- [ ] Both services show as `online`

---

## Nginx Configuration (Optional)

### Setup
- [ ] Nginx configuration file created
- [ ] Frontend proxy configured (port 3000)
- [ ] Backend proxy configured (port 8000)
- [ ] Configuration symlinked to sites-enabled
- [ ] Default site disabled
- [ ] Configuration tested (`nginx -t`)
- [ ] Nginx restarted
- [ ] Nginx enabled on boot

---

## CI/CD Pipeline

### SSH Keys
- [ ] SSH key pair generated
- [ ] Public key added to server `~/.ssh/authorized_keys`
- [ ] Private key added to GitHub Secrets (`SSH_PRIVATE_KEY`)
- [ ] SSH connection tested

### GitHub Secrets
- [ ] `SSH_PRIVATE_KEY` added
- [ ] `SERVER_HOST` added (143.110.191.22)
- [ ] `SERVER_USER` added (root or username)
- [ ] `SERVER_PORT` added (22)

### Workflow Files
- [ ] `.github/workflows/` directory created
- [ ] `deploy.yml` workflow file created
- [ ] Workflow syntax validated
- [ ] Deploy script created on server (`/var/www/deploy.sh`)
- [ ] Deploy script executable (`chmod +x`)

---

## Testing

### Backend Testing
- [ ] Health endpoint accessible (`/health`)
- [ ] API docs accessible (`/docs`)
- [ ] Can fetch indents (`/api/v1/indents`)
- [ ] Can submit bids (`/api/v1/bids`)
- [ ] Firebase connection confirmed
- [ ] No errors in PM2 logs

### Frontend Testing
- [ ] Homepage loads
- [ ] Dashboard displays
- [ ] Can create indents
- [ ] Can submit bids
- [ ] API calls working
- [ ] No console errors

### Integration Testing
- [ ] Frontend can communicate with backend
- [ ] Data saves to Firebase
- [ ] Real-time updates working
- [ ] Analytics displaying correctly

### URL Testing
**Without Nginx:**
- [ ] http://143.110.191.22:3000 (Frontend)
- [ ] http://143.110.191.22:8000/docs (API Docs)
- [ ] http://143.110.191.22:8000/health (Health)

**With Nginx:**
- [ ] http://143.110.191.22 (Frontend)
- [ ] http://143.110.191.22/docs (API Docs)
- [ ] http://143.110.191.22/api/v1/indents (API)
- [ ] http://143.110.191.22/health (Health)

---

## Security

### Secrets Management
- [ ] `.env` files not in Git
- [ ] `serviceAccountKey.json` not in Git
- [ ] `.gitignore` properly configured
- [ ] File permissions set (600 for secrets)
- [ ] No secrets in logs

### Access Control
- [ ] SSH key authentication only
- [ ] Password authentication disabled
- [ ] Root login disabled (recommended)
- [ ] Firewall active and configured
- [ ] Only necessary ports open

---

## Monitoring

### Logs Setup
- [ ] PM2 logs accessible
- [ ] Nginx logs accessible
- [ ] Log rotation configured
- [ ] Error monitoring setup

### Health Checks
- [ ] Backend health endpoint working
- [ ] PM2 monitoring active
- [ ] Uptime monitoring configured (optional)

---

## Post-Deployment

### Verification
- [ ] All services running (`pm2 list`)
- [ ] No errors in logs
- [ ] URLs accessible from external network
- [ ] Firebase data syncing
- [ ] CI/CD pipeline tested

### Documentation
- [ ] Deployment documented
- [ ] Access credentials stored securely
- [ ] Team notified
- [ ] Rollback procedure documented

### Backup
- [ ] Database backup configured
- [ ] Code repository backed up
- [ ] Secrets backed up securely
- [ ] Recovery procedure tested

---

## CI/CD Testing

### First Deployment
- [ ] Make test commit
- [ ] Push to main branch
- [ ] GitHub Actions workflow triggered
- [ ] Workflow completes successfully
- [ ] Services restarted automatically
- [ ] Changes reflected on server

### Rollback Test
- [ ] Rollback procedure documented
- [ ] Test rollback to previous version
- [ ] Verify rollback works
- [ ] Document rollback time

---

## Performance

### Optimization
- [ ] Frontend build optimized
- [ ] Backend running in production mode
- [ ] Gzip compression enabled (Nginx)
- [ ] Static file caching configured
- [ ] Database queries optimized

### Load Testing (Optional)
- [ ] Load testing performed
- [ ] Performance benchmarks recorded
- [ ] Bottlenecks identified
- [ ] Scaling plan documented

---

## Final Checks

### Functionality
- [ ] All features working
- [ ] No broken links
- [ ] Forms submitting correctly
- [ ] Data persisting correctly
- [ ] Real-time updates working

### User Experience
- [ ] Page load times acceptable
- [ ] No UI glitches
- [ ] Mobile responsive (if applicable)
- [ ] Error messages user-friendly

### Production Ready
- [ ] Debug mode OFF
- [ ] Proper error handling
- [ ] Logging configured
- [ ] Monitoring active
- [ ] Backup strategy in place

---

## Sign-Off

### Deployment Team
- [ ] Developer approval
- [ ] QA approval
- [ ] DevOps approval
- [ ] Stakeholder notification

### Documentation
- [ ] README updated
- [ ] API documentation current
- [ ] Deployment guide complete
- [ ] Troubleshooting guide available

---

## Emergency Contacts

**Server Issues:**
- Server Admin: [Contact]
- Hosting Provider: [Contact]

**Application Issues:**
- Backend Developer: [Contact]
- Frontend Developer: [Contact]
- Database Admin: [Contact]

**Firebase Issues:**
- Firebase Console: https://console.firebase.google.com/
- Firebase Support: [Contact]

---

## Quick Commands

```bash
# SSH into server
ssh root@143.110.191.22

# Check services
pm2 list
pm2 logs

# Restart services
pm2 restart tvs-backend
pm2 restart tvs-frontend

# View logs
pm2 logs tvs-backend --lines 100
pm2 logs tvs-frontend --lines 100

# Check Nginx
sudo systemctl status nginx
sudo nginx -t

# Update application
cd /var/www/Digital-Vehicle-Procurement
git pull origin main
/var/www/deploy.sh

# Check firewall
sudo ufw status

# Check ports
sudo netstat -tulpn | grep -E ':(3000|8000|80)'
```

---

## Deployment Status

**Date**: _______________  
**Deployed By**: _______________  
**Version**: _______________  
**Status**: ⬜ Ready ⬜ In Progress ⬜ Complete ⬜ Failed

**Notes**:
_____________________________________________
_____________________________________________
_____________________________________________

---

**Checklist Version**: 1.0  
**Last Updated**: 2026-02-06
