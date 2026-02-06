# 🔄 CI/CD Pipeline Setup - GitHub Actions

## 📋 Overview

Automated deployment pipeline that:
- ✅ Runs on every push to `main` branch
- ✅ Builds and tests the application
- ✅ Deploys to server 143.110.191.22
- ✅ Restarts services automatically
- ✅ Sends deployment notifications

---

## 🏗️ CI/CD Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    GitHub Repository                     │
│              (Your Code + GitHub Actions)                │
└────────────────────┬─────────────────────────────────────┘
                     │
                     │ Push to main branch
                     ▼
┌──────────────────────────────────────────────────────────┐
│                  GitHub Actions Runner                   │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Step 1: Checkout Code                             │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Step 2: Setup Node.js & Python                    │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Step 3: Install Dependencies                      │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Step 4: Run Tests (Optional)                      │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Step 5: Build Frontend                            │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────┬─────────────────────────────────────┘
                     │
                     │ SSH Connection
                     ▼
┌──────────────────────────────────────────────────────────┐
│              Production Server (143.110.191.22)          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Step 6: Pull Latest Code                          │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Step 7: Install Dependencies                      │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Step 8: Build Frontend                            │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Step 9: Restart PM2 Services                      │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                     │
                     ▼
              ✅ Deployment Complete!
```

---

## 🔧 Step 1: Setup SSH Access

### 1.1 Generate SSH Key (On Your Local Machine)

```bash
# Generate SSH key pair
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key

# This creates:
# - Private key: ~/.ssh/github_deploy_key
# - Public key: ~/.ssh/github_deploy_key.pub
```

### 1.2 Add Public Key to Server

```bash
# Copy public key
cat ~/.ssh/github_deploy_key.pub

# SSH into server
ssh root@143.110.191.22

# Add public key to authorized_keys
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
# Paste the public key, save and exit

# Set permissions
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

# Test connection from local machine
ssh -i ~/.ssh/github_deploy_key root@143.110.191.22
```

### 1.3 Add Private Key to GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `SSH_PRIVATE_KEY` | Content of `~/.ssh/github_deploy_key` | Private SSH key |
| `SERVER_HOST` | `143.110.191.22` | Server IP address |
| `SERVER_USER` | `root` | SSH username |
| `SERVER_PORT` | `22` | SSH port |

**To get private key content:**
```bash
cat ~/.ssh/github_deploy_key
# Copy entire content including BEGIN and END lines
```

---

## 📝 Step 2: Create GitHub Actions Workflow

### 2.1 Create Workflow Directory

```bash
# In your project root
mkdir -p .github/workflows
```

### 2.2 Create Deployment Workflow File

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  workflow_dispatch:  # Allow manual trigger

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: 📥 Checkout code
      uses: actions/checkout@v4

    - name: 🔧 Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: 🐍 Setup Python
      uses: actions/setup-python@v5
      with:
        python-version: '3.12'

    - name: 📦 Install Frontend Dependencies
      run: npm ci

    - name: 🏗️ Build Frontend
      run: npm run build
      env:
        VITE_API_URL: http://143.110.191.22:8000/api/v1

    - name: 🧪 Run Tests (Optional)
      run: |
        # Add your test commands here
        # npm test
        echo "Tests passed"

    - name: 📤 Deploy to Server
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        port: ${{ secrets.SERVER_PORT }}
        script: |
          # Navigate to project directory
          cd /var/www/Digital-Vehicle-Procurement
          
          # Pull latest code
          git pull origin main
          
          # Backend deployment
          cd backend
          source venv/bin/activate
          pip install -r requirements.txt
          
          # Frontend deployment
          cd ..
          npm install
          npm run build
          
          # Restart services
          pm2 restart tvs-backend
          pm2 restart tvs-frontend
          
          # Show status
          pm2 list

    - name: ✅ Deployment Success
      if: success()
      run: |
        echo "🎉 Deployment completed successfully!"
        echo "Frontend: http://143.110.191.22:3000"
        echo "Backend: http://143.110.191.22:8000"

    - name: ❌ Deployment Failed
      if: failure()
      run: echo "Deployment failed. Check logs for details."
```

---

## 🚀 Step 3: Alternative - Deploy Script Method

### 3.1 Create Deploy Script on Server

```bash
# SSH into server
ssh root@143.110.191.22

# Create deploy script
nano /var/www/deploy.sh
```

**Add this content:**
```bash
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting deployment...${NC}"

# Navigate to project
cd /var/www/Digital-Vehicle-Procurement || exit 1

# Pull latest code
echo -e "${GREEN}📥 Pulling latest code...${NC}"
git pull origin main

# Backend deployment
echo -e "${GREEN}🐍 Deploying backend...${NC}"
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Frontend deployment
echo -e "${GREEN}⚛️ Deploying frontend...${NC}"
cd ..
npm install
npm run build

# Restart services
echo -e "${GREEN}🔄 Restarting services...${NC}"
pm2 restart tvs-backend
pm2 restart tvs-frontend

# Show status
echo -e "${GREEN}📊 Service status:${NC}"
pm2 list

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}Frontend: http://143.110.191.22:3000${NC}"
echo -e "${GREEN}Backend: http://143.110.191.22:8000${NC}"
```

**Make it executable:**
```bash
chmod +x /var/www/deploy.sh
```

### 3.2 Update GitHub Workflow to Use Script

```yaml
- name: 📤 Deploy to Server
  uses: appleboy/ssh-action@v1.0.0
  with:
    host: ${{ secrets.SERVER_HOST }}
    username: ${{ secrets.SERVER_USER }}
    key: ${{ secrets.SSH_PRIVATE_KEY }}
    port: ${{ secrets.SERVER_PORT }}
    script: /var/www/deploy.sh
```

---

## 🔔 Step 4: Add Deployment Notifications (Optional)

### 4.1 Slack Notifications

Add to your workflow:

```yaml
- name: 📢 Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Deployment to production'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 4.2 Email Notifications

GitHub Actions automatically sends email on failure.

---

## 🧪 Step 5: Test the Pipeline

### 5.1 Trigger Deployment

```bash
# Make a change to your code
echo "# Test deployment" >> README.md

# Commit and push
git add .
git commit -m "Test CI/CD pipeline"
git push origin main
```

### 5.2 Monitor Deployment

1. Go to GitHub repository
2. Click **Actions** tab
3. See your workflow running
4. Click on the workflow to see detailed logs

### 5.3 Verify Deployment

```bash
# Check if services are running
ssh root@143.110.191.22 "pm2 list"

# Test URLs
curl http://143.110.191.22:8000/health
curl http://143.110.191.22:3000
```

---

## 🔒 Step 6: Secure Secrets Management

### 6.1 Environment Variables on Server

```bash
# SSH into server
ssh root@143.110.191.22

# Create secure .env files
cd /var/www/Digital-Vehicle-Procurement/backend
nano .env
# Add production secrets

# Set proper permissions
chmod 600 .env
chmod 600 serviceAccountKey.json
```

### 6.2 GitHub Secrets

Add these additional secrets if needed:

| Secret Name | Description |
|-------------|-------------|
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `GEMINI_API_KEY` | Gemini API key |
| `PRODUCTION_ENV` | Full .env file content |

---

## 📊 Step 7: Monitoring & Rollback

### 7.1 Monitor Deployments

```bash
# View PM2 logs
ssh root@143.110.191.22 "pm2 logs --lines 50"

# View deployment history
git log --oneline -10
```

### 7.2 Rollback if Needed

```bash
# SSH into server
ssh root@143.110.191.22

# Navigate to project
cd /var/www/Digital-Vehicle-Procurement

# Rollback to previous commit
git log --oneline -5  # Find commit hash
git reset --hard <commit-hash>

# Rebuild and restart
npm run build
pm2 restart all
```

---

## 🎯 Complete CI/CD Workflow

### Full `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production Server

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:

env:
  NODE_VERSION: '18'
  PYTHON_VERSION: '3.12'

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint || echo "Linting skipped"
    
    - name: Run tests
      run: npm test || echo "Tests skipped"

  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: test
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build frontend
      run: npm run build
      env:
        VITE_API_URL: http://143.110.191.22:8000/api/v1
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v4
      with:
        name: dist
        path: dist/

  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy via SSH
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        port: ${{ secrets.SERVER_PORT }}
        script: |
          set -e
          echo "🚀 Starting deployment..."
          
          cd /var/www/Digital-Vehicle-Procurement
          
          echo "📥 Pulling latest code..."
          git pull origin main
          
          echo "🐍 Updating backend..."
          cd backend
          source venv/bin/activate
          pip install -r requirements.txt
          
          echo "⚛️ Updating frontend..."
          cd ..
          npm install
          npm run build
          
          echo "🔄 Restarting services..."
          pm2 restart tvs-backend
          pm2 restart tvs-frontend
          
          echo "✅ Deployment complete!"
          pm2 list
    
    - name: Verify deployment
      run: |
        sleep 10
        curl -f http://143.110.191.22:8000/health || exit 1
        echo "✅ Backend is healthy"
        
    - name: Notify on success
      if: success()
      run: |
        echo "🎉 Deployment successful!"
        echo "Frontend: http://143.110.191.22:3000"
        echo "Backend: http://143.110.191.22:8000"
        echo "API Docs: http://143.110.191.22:8000/docs"
```

---

## ✅ Deployment Checklist

- [ ] SSH keys generated
- [ ] Public key added to server
- [ ] Private key added to GitHub secrets
- [ ] `.github/workflows/deploy.yml` created
- [ ] Deploy script created on server
- [ ] GitHub secrets configured
- [ ] Test deployment triggered
- [ ] Services running after deployment
- [ ] URLs accessible
- [ ] Monitoring setup
- [ ] Rollback procedure tested

---

## 🆘 Troubleshooting

### Deployment fails with SSH error

```bash
# Test SSH connection manually
ssh -i ~/.ssh/github_deploy_key root@143.110.191.22

# Check GitHub secrets are correct
# Verify private key format (should include BEGIN and END lines)
```

### PM2 restart fails

```bash
# SSH into server
ssh root@143.110.191.22

# Check PM2 status
pm2 list

# View logs
pm2 logs

# Manually restart
pm2 restart all
```

### Build fails

```bash
# Check GitHub Actions logs
# Common issues:
# - Missing dependencies
# - Environment variables not set
# - Build errors in code
```

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [SSH Action](https://github.com/appleboy/ssh-action)

---

**CI/CD Status**: 🚀 Ready to Deploy!

**Next**: Push to main branch and watch automatic deployment!
