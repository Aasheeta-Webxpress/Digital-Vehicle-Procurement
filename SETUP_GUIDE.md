# 🚀 Complete Setup & Deployment Guide

## Overview

This guide walks you through the complete setup process from development to production deployment for the TVS Digital Vehicle Procurement System.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Firebase Setup](#firebase-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Local Development](#local-development)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### Required Software

- **Node.js** 18+ and npm
- **Python** 3.8+ and pip
- **Git**
- **Google Account** (for Firebase)

### Verify Installation

```bash
# Check Node.js
node --version  # Should be 18.x or higher

# Check Python
python --version  # Should be 3.8 or higher

# Check Git
git --version
```

---

## 🔥 Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `tvs-procurement` (or your choice)
4. Enable Google Analytics (recommended)
5. Select Analytics location (e.g., India)
6. Click "Create project"
7. Wait for project creation (~1 minute)

### Step 2: Enable Firestore Database

1. In Firebase Console, click "Firestore Database" in left sidebar
2. Click "Create database"
3. Select **"Start in production mode"**
4. Choose location: **asia-south1** (Mumbai, India)
   - ⚠️ **Important**: Location cannot be changed later
5. Click "Enable"
6. Wait for database creation (~2 minutes)

### Step 3: Generate Service Account Key

1. Click ⚙️ (Settings) → "Project settings"
2. Go to "Service accounts" tab
3. Click "Generate new private key"
4. Click "Generate key" in confirmation dialog
5. Save the downloaded JSON file as `serviceAccountKey.json`
6. **⚠️ CRITICAL**: Keep this file secure, never commit to Git

### Step 4: Configure Security Rules

1. In Firestore, click "Rules" tab
2. Replace with the following rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Development: Allow all (TEMPORARY)
    match /{document=**} {
      allow read, write: if true;
    }
    
    // TODO: Tighten rules for production
  }
}
```

3. Click "Publish"

### Step 5: Note Your Project ID

1. In Project Settings → General tab
2. Copy your **Project ID** (e.g., `tvs-procurement-12345`)
3. You'll need this for backend configuration

---

## 🐍 Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment

```bash
# Copy environment template
copy .env.example .env  # Windows
# OR
cp .env.example .env    # Mac/Linux
```

### Step 5: Edit `.env` File

Open `.env` and update:

```env
# Firebase Configuration
FIREBASE_CREDENTIALS_PATH=./serviceAccountKey.json
FIREBASE_PROJECT_ID=your-actual-project-id  # From Step 5 above

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=True

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Environment
ENVIRONMENT=development
DEBUG=True
```

### Step 6: Add Firebase Credentials

1. Copy the `serviceAccountKey.json` file you downloaded earlier
2. Place it in the `backend/` directory
3. Verify the path matches `FIREBASE_CREDENTIALS_PATH` in `.env`

### Step 7: Initialize Database (Optional)

Populate Firebase with sample data:

```bash
python scripts/init_data.py
```

Expected output:
```
Creating lanes...
  Created lane: L1
  Created lane: L2
  ...
✅ Data initialization completed successfully!
```

### Step 8: Start Backend Server

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# OR using Python
python -m app.main
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     ✅ Firebase connected successfully
```

### Step 9: Verify Backend

Open browser and visit:
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

---

## ⚛️ Frontend Setup

### Step 1: Navigate to Project Root

```bash
cd ..  # Go back to project root
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment

```bash
# Copy environment template
copy .env.example .env.local  # Windows
# OR
cp .env.example .env.local    # Mac/Linux
```

### Step 4: Edit `.env.local`

```env
# Backend API URL
VITE_API_URL=http://localhost:8000/api/v1

# Gemini API Key (optional)
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### Step 5: Update services.ts

Open `services.ts` and change:

```typescript
// Change from:
const USE_MOCK_MODE = true;

// To:
const USE_MOCK_MODE = false;  // Use backend API
```

### Step 6: Start Frontend

```bash
npm run dev
```

Expected output:
```
  VITE v6.2.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
```

### Step 7: Verify Frontend

Open browser and visit: http://localhost:5173/

You should see the procurement dashboard with data from Firebase.

---

## 💻 Local Development

### Running Both Services

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate  # Windows
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Development Workflow

1. **Make changes** to backend or frontend code
2. **Auto-reload** happens automatically
3. **Test** in browser at http://localhost:5173/
4. **Check API** at http://localhost:8000/docs
5. **View Firebase** data in Firebase Console

### Testing API Endpoints

Using the interactive docs at http://localhost:8000/docs:

1. Click on an endpoint (e.g., `GET /api/v1/indents`)
2. Click "Try it out"
3. Click "Execute"
4. View the response

Or using curl:

```bash
# Get all indents
curl http://localhost:8000/api/v1/indents

# Create indent
curl -X POST http://localhost:8000/api/v1/indents \
  -H "Content-Type: application/json" \
  -d @sample_indent.json

# Submit bid
curl -X POST http://localhost:8000/api/v1/bids \
  -H "Content-Type: application/json" \
  -d '{
    "indentId": "TR001",
    "vendorId": "V1",
    "vendorName": "Safe Logistics India",
    "amount": 25000
  }'
```

---

## 🌐 Production Deployment

### Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] Firebase security rules configured
- [ ] Environment variables documented
- [ ] Secrets secured (not in Git)
- [ ] CORS origins updated for production
- [ ] HTTPS configured
- [ ] Error logging set up
- [ ] Backup strategy in place

### Backend Deployment Options

#### Option 1: Google Cloud Run (Recommended)

**Why**: Best integration with Firebase, auto-scaling, pay-per-use

```bash
# 1. Install Google Cloud SDK
# Download from: https://cloud.google.com/sdk/docs/install

# 2. Login
gcloud auth login

# 3. Set project
gcloud config set project YOUR_PROJECT_ID

# 4. Build and deploy
cd backend
gcloud run deploy tvs-procurement-api \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars ENVIRONMENT=production,DEBUG=False \
  --set-secrets FIREBASE_CREDENTIALS=firebase-credentials:latest
```

#### Option 2: Heroku

```bash
# 1. Install Heroku CLI
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# 2. Login
heroku login

# 3. Create app
cd backend
heroku create tvs-procurement-api

# 4. Set environment variables
heroku config:set FIREBASE_PROJECT_ID=your-project-id
heroku config:set ENVIRONMENT=production
heroku config:set DEBUG=False

# 5. Deploy
git push heroku main
```

#### Option 3: Railway

1. Go to [Railway.app](https://railway.app/)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Set root directory to `backend`
5. Add environment variables in Railway dashboard
6. Deploy

### Frontend Deployment Options

#### Option 1: Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Set environment variables in Vercel dashboard
# VITE_API_URL=https://your-api-domain.com/api/v1
```

#### Option 2: Netlify

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Build
npm run build

# 4. Deploy
netlify deploy --prod --dir=dist
```

#### Option 3: Firebase Hosting

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Initialize
firebase init hosting

# 4. Build
npm run build

# 5. Deploy
firebase deploy --only hosting
```

### Post-Deployment

1. **Update Frontend Environment**:
   ```env
   VITE_API_URL=https://your-api-domain.com/api/v1
   ```

2. **Update Backend CORS**:
   ```env
   CORS_ORIGINS=https://your-frontend-domain.com
   ```

3. **Test Production**:
   - Visit your frontend URL
   - Test creating indents
   - Test submitting bids
   - Check Firebase Console for data

4. **Monitor**:
   - Check application logs
   - Monitor Firebase usage
   - Set up alerts for errors

---

## 🐛 Troubleshooting

### Backend Issues

#### Firebase not connected

**Error**: `Firebase not connected - Running in mock mode`

**Solutions**:
1. Check `serviceAccountKey.json` exists in `backend/`
2. Verify `FIREBASE_CREDENTIALS_PATH` in `.env`
3. Ensure Firebase project ID is correct
4. Check file permissions

#### CORS errors

**Error**: `Access blocked by CORS policy`

**Solutions**:
1. Add frontend URL to `CORS_ORIGINS` in `.env`
2. Restart backend server
3. Clear browser cache

#### Port already in use

**Error**: `Address already in use`

**Solutions**:
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :8000
kill -9 <PID>
```

### Frontend Issues

#### API calls failing

**Error**: `Failed to fetch`

**Solutions**:
1. Ensure backend is running
2. Check `VITE_API_URL` in `.env.local`
3. Verify `USE_MOCK_MODE = false` in `services.ts`
4. Check browser console for errors

#### Environment variables not working

**Solutions**:
1. Restart Vite dev server
2. Ensure variables start with `VITE_`
3. Check `.env.local` exists
4. Clear browser cache

### Firebase Issues

#### Permission denied

**Error**: `Missing or insufficient permissions`

**Solutions**:
1. Check Firebase security rules
2. Verify service account has correct permissions
3. Ensure Firestore is enabled

#### Quota exceeded

**Error**: `Quota exceeded`

**Solutions**:
1. Check Firebase usage in console
2. Upgrade to Blaze plan if needed
3. Optimize queries to reduce reads

---

## 📊 Monitoring & Maintenance

### Daily Checks

- [ ] Check application logs for errors
- [ ] Monitor Firebase usage
- [ ] Verify API response times
- [ ] Check for failed deployments

### Weekly Tasks

- [ ] Review security logs
- [ ] Update dependencies
- [ ] Check backup status
- [ ] Review performance metrics

### Monthly Tasks

- [ ] Rotate credentials
- [ ] Review and optimize costs
- [ ] Update documentation
- [ ] Security audit

---

## 📞 Support

### Resources

- **Firebase Documentation**: https://firebase.google.com/docs
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **React Documentation**: https://react.dev/

### Getting Help

1. Check this guide first
2. Review implementation plan
3. Check Firebase Console for errors
4. Review application logs
5. Test with API documentation

---

## ✅ Success Criteria

Your deployment is successful when:

- ✅ Backend API responds at `/health`
- ✅ Frontend loads without errors
- ✅ Can create new indents
- ✅ Can submit bids
- ✅ Data appears in Firebase Console
- ✅ Real-time updates work
- ✅ Analytics display correctly
- ✅ No CORS errors
- ✅ HTTPS enabled (production)
- ✅ Monitoring active

---

## 🎉 Next Steps

After successful deployment:

1. **Add Authentication**: Implement user login
2. **Enable Notifications**: Email/SMS for bid updates
3. **Add Analytics**: Track user behavior
4. **Implement Caching**: Improve performance
5. **Set up CI/CD**: Automate deployments
6. **Add Testing**: Unit and integration tests
7. **Improve Security**: Tighten Firebase rules
8. **Scale**: Add load balancing if needed

Congratulations! Your TVS Procurement System is now live! 🚀
