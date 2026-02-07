# 🚀 QUICK START GUIDE
## Digital Vehicle Procurement System

---

## ⚡ FIRST TIME SETUP

### 1. Clone & Install
```bash
git clone <repository-url>
cd Digital-Vehicle-Procurement
npm install
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

**Frontend** - Create `.env` in project root:
```env
VITE_API_URL=http://143.110.191.22:8020/api/v1
VITE_API_BASE=http://143.110.191.22:8020
VITE_ENV=development
VITE_USE_MOCK_MODE=false
```

**Backend** - Create `backend/.env`:
```env
FIREBASE_PROJECT_ID=controltower-1099
FIREBASE_CREDENTIALS_PATH=./serviceAccountKey.json
API_HOST=0.0.0.0
API_PORT=8020
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
ENVIRONMENT=development
DEBUG=True
SECRET_KEY=dev-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### 3. Add Firebase Credentials
- Get `serviceAccountKey.json` from Firebase Console
- Place in `backend/` directory
- **NEVER commit this file!**

---

## 🏃 RUN THE APP

### Terminal 1 - Backend:
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8020
```

### Terminal 2 - Frontend:
```bash
npm run dev
```

### Open Browser:
```
http://localhost:5173
```

---

## 🔧 COMMON COMMANDS

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Backend with specific port
cd backend
uvicorn app.main:app --reload --port 8020

# Check backend config
cd backend
python -c "from app.config import settings; print(settings.cors_origins_list)"
```

---

## ❌ TROUBLESHOOTING

### Login fails with 404:
```bash
# Check .env file exists
cat .env

# Verify API URL
echo $VITE_API_BASE

# Check backend is running
curl http://localhost:8020/docs
```

### White screen:
```bash
# Open browser console (F12)
# Check for errors
# Clear localStorage
localStorage.clear()
```

### CORS errors:
```bash
# Check backend CORS settings
cd backend
python -c "from app.config import settings; print(settings.cors_origins_list)"

# Should NOT contain '*'
```

---

## 📝 BEFORE COMMITTING

```bash
# 1. Check what you're committing
git status

# 2. VERIFY these are NOT listed:
# ❌ .env
# ❌ backend/.env
# ❌ serviceAccountKey.json

# 3. If they appear, they're NOT in .gitignore!
# Add them to .gitignore immediately

# 4. Stage only safe files
git add <specific-files>

# 5. Commit
git commit -m "your message"

# 6. Push
git push
```

---

## 🆘 EMERGENCY FIXES

### Broke production?
```bash
# Revert immediately
git revert HEAD
git push origin main
```

### Need to test locally?
```bash
# Build and preview
npm run build
npm run preview
```

---

## 📚 DOCUMENTATION

- `PRODUCTION_READY.md` - **START HERE**
- `DEPLOYMENT_CHECKLIST.md` - Before deploying
- `FIXES_IMPLEMENTED.md` - What was fixed
- `CODE_REVIEW_REPORT.md` - Detailed analysis

---

## 🎯 KEY POINTS

1. ✅ Always use `.env` files
2. ❌ Never commit `.env` or `serviceAccountKey.json`
3. ✅ Test locally before committing
4. ✅ Review changes with `git diff`
5. ✅ Use specific `git add` (not `git add .`)

---

**Need help?** Check `PRODUCTION_READY.md` for complete guide!
