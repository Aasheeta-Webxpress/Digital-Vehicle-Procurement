# 🔒 DO NOT COMMIT TO GIT - Security Critical Files

## ⚠️ NEVER COMMIT THESE FILES

These files contain sensitive information and should **NEVER** be pushed to Git/GitHub:

---

## 🔥 **CRITICAL - Firebase Credentials**

### ❌ `backend/serviceAccountKey.json`
**Why**: Contains your Firebase private key and credentials  
**Risk**: Anyone can access your entire Firebase database  
**Status**: ✅ Already in .gitignore

---

## 🔐 **CRITICAL - Environment Variables**

### ❌ `backend/.env`
**Why**: Contains Firebase project ID, API keys, secrets  
**Risk**: Exposes your configuration and credentials  
**Status**: ✅ Already in .gitignore

### ❌ `.env.local`
**Why**: Contains Gemini API key and frontend config  
**Risk**: API key theft, unauthorized usage  
**Status**: ✅ Already in .gitignore

---

## 📁 **Python/Node Dependencies**

### ❌ `backend/venv/` (entire folder)
**Why**: Python virtual environment (large, machine-specific)  
**Risk**: Bloats repository, not needed  
**Status**: ✅ Already in .gitignore

### ❌ `node_modules/` (entire folder)
**Why**: Node.js dependencies (very large)  
**Risk**: Bloats repository, not needed  
**Status**: ✅ Already in .gitignore

---

## 🗑️ **Cache & Build Files**

### ❌ `backend/__pycache__/` (folder)
**Why**: Python compiled bytecode  
**Status**: ✅ Already in .gitignore

### ❌ `backend/app/__pycache__/` (folder)
**Why**: Python compiled bytecode  
**Status**: ✅ Already in .gitignore

### ❌ `dist/` (folder)
**Why**: Build output  
**Status**: ✅ Already in .gitignore

### ❌ `.vite/` (folder)
**Why**: Vite cache  
**Status**: ✅ Already in .gitignore

---

## 💻 **IDE & OS Files**

### ❌ `.vscode/` (folder)
**Why**: VS Code settings (personal preferences)  
**Status**: ✅ Already in .gitignore

### ❌ `.idea/` (folder)
**Why**: IntelliJ/PyCharm settings  
**Status**: ✅ Already in .gitignore

### ❌ `.DS_Store` (Mac)
**Why**: macOS folder metadata  
**Status**: ✅ Already in .gitignore

### ❌ `Thumbs.db` (Windows)
**Why**: Windows thumbnail cache  
**Status**: ✅ Already in .gitignore

---

## 📝 **Log Files**

### ❌ `*.log`
**Why**: Application logs (may contain sensitive data)  
**Status**: ✅ Already in .gitignore

### ❌ `backend/logs/` (folder)
**Why**: Log files  
**Status**: ✅ Already in .gitignore

---

## ✅ **SAFE TO COMMIT**

These files are **SAFE** and **SHOULD** be committed:

### ✅ `backend/.env.example`
**Why**: Template for .env (no real secrets)  
**Purpose**: Shows others what variables are needed

### ✅ `.env.example`
**Why**: Template for .env.local (no real secrets)  
**Purpose**: Shows others what variables are needed

### ✅ `backend/.gitignore`
**Why**: Tells Git what to ignore  
**Purpose**: Protects sensitive files

### ✅ `.gitignore`
**Why**: Tells Git what to ignore  
**Purpose**: Protects sensitive files

### ✅ All source code files
- `*.py` (Python files)
- `*.ts`, `*.tsx` (TypeScript files)
- `*.json` (package.json, tsconfig.json, etc.)
- `*.md` (Documentation)
- `*.html`, `*.css`

### ✅ Configuration files
- `requirements.txt`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `vite.config.ts`

---

## 🔍 **How to Check What's Ignored**

### View .gitignore files:

**Root .gitignore:**
```bash
cat .gitignore
```

**Backend .gitignore:**
```bash
cat backend/.gitignore
```

### Check Git status:
```bash
git status
```

**If you see these files listed, DON'T COMMIT THEM:**
- `.env`
- `.env.local`
- `serviceAccountKey.json`
- `venv/`
- `node_modules/`

---

## 🚨 **EMERGENCY: If You Already Committed Secrets**

### If you accidentally committed sensitive files:

1. **Remove from Git history:**
   ```bash
   # Remove file from Git but keep locally
   git rm --cached backend/.env
   git rm --cached backend/serviceAccountKey.json
   git rm --cached .env.local
   
   # Commit the removal
   git commit -m "Remove sensitive files from Git"
   
   # Push changes
   git push
   ```

2. **Rotate all secrets immediately:**
   - Generate new Firebase service account key
   - Get new Gemini API key
   - Update your local `.env` files

3. **Add to .gitignore if missing:**
   ```bash
   echo "backend/.env" >> .gitignore
   echo "backend/serviceAccountKey.json" >> backend/.gitignore
   git add .gitignore backend/.gitignore
   git commit -m "Update .gitignore"
   ```

---

## 📋 **Complete List - DO NOT COMMIT**

```
# Environment & Secrets
backend/.env
.env.local
backend/serviceAccountKey.json

# Dependencies
backend/venv/
node_modules/

# Python Cache
backend/__pycache__/
backend/app/__pycache__/
backend/app/services/__pycache__/
backend/app/routes/__pycache__/
backend/app/models/__pycache__/
*.pyc
*.pyo
*.pyd

# Build & Distribution
dist/
build/
*.egg-info/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
desktop.ini

# Logs
*.log
backend/logs/

# Vite
.vite/
```

---

## ✅ **Verification Checklist**

Before pushing to Git:

```bash
# 1. Check what will be committed
git status

# 2. Verify .gitignore is working
git check-ignore backend/.env
git check-ignore backend/serviceAccountKey.json
git check-ignore .env.local

# Should output the filename if ignored correctly

# 3. Review files to be committed
git diff --cached

# 4. Only commit if no secrets are visible
git commit -m "Your commit message"
git push
```

---

## 🎯 **Quick Security Check**

Run this before every commit:

```bash
# Check for sensitive files
git status | grep -E "\.env$|serviceAccountKey|\.env\.local"

# If this returns anything, DON'T COMMIT!
```

---

## 📚 **Summary**

### ❌ **NEVER COMMIT:**
1. `backend/.env` - Backend secrets
2. `backend/serviceAccountKey.json` - Firebase credentials
3. `.env.local` - Frontend API keys
4. `backend/venv/` - Python virtual environment
5. `node_modules/` - Node dependencies

### ✅ **ALWAYS COMMIT:**
1. `.env.example` - Environment template
2. `backend/.env.example` - Backend template
3. `.gitignore` - Git ignore rules
4. All source code files
5. Documentation files

### 🔒 **GOLDEN RULE:**
**If it contains a password, API key, or secret → DON'T COMMIT IT!**

---

**Your .gitignore files are already configured correctly!**  
Just make sure you never use `git add .` without checking `git status` first.
