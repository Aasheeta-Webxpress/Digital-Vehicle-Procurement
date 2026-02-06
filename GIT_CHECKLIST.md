# 🔒 Git Security - Quick Reference

## ❌ NEVER COMMIT THESE FILES:

### 🔥 **CRITICAL - Contains Secrets:**

1. **`backend/serviceAccountKey.json`**
   - Firebase private key
   - ✅ Protected by backend/.gitignore

2. **`backend/.env`**
   - Firebase project ID, API keys
   - ✅ Protected by backend/.gitignore

3. **`.env.local`**
   - Gemini API key
   - ✅ Protected by .gitignore (*.local)

### 📁 **Large Folders - Not Needed:**

4. **`backend/venv/`**
   - Python virtual environment
   - ✅ Protected by backend/.gitignore

5. **`node_modules/`**
   - Node.js dependencies
   - ✅ Protected by .gitignore

---

## ✅ SAFE TO COMMIT:

- ✅ `.env.example` (template, no secrets)
- ✅ `backend/.env.example` (template, no secrets)
- ✅ All `.py`, `.ts`, `.tsx` files
- ✅ `package.json`, `requirements.txt`
- ✅ All documentation (`.md` files)
- ✅ `.gitignore` files

---

## 🔍 Before Every Git Push:

```bash
# 1. Check what will be committed
git status

# 2. Look for these files (should NOT appear):
#    - backend/.env
#    - backend/serviceAccountKey.json
#    - .env.local
#    - venv/
#    - node_modules/

# 3. If you see any of the above, DON'T COMMIT!

# 4. Safe to commit if you only see:
#    - .py, .ts, .tsx files
#    - .md files
#    - package.json, requirements.txt
#    - .gitignore files
```

---

## ✅ Your .gitignore is Already Configured!

Both `.gitignore` files are properly set up to protect:
- ✅ Firebase credentials
- ✅ Environment variables
- ✅ Virtual environments
- ✅ Dependencies
- ✅ Cache files

**You're protected!** Just use `git status` before committing.

---

## 🚨 Quick Security Check:

```bash
# Run this before committing:
git status | findstr /C:".env" /C:"serviceAccount"

# If this returns NOTHING → Safe to commit ✅
# If this shows files → DON'T COMMIT ❌
```

---

## 📝 Safe Git Workflow:

```bash
# 1. Check status
git status

# 2. Add only source files (be specific!)
git add backend/app/
git add *.ts
git add *.tsx
git add *.md
git add package.json

# 3. DON'T use "git add ." blindly!

# 4. Verify what's staged
git status

# 5. Commit
git commit -m "Your message"

# 6. Push
git push
```

---

## 🎯 Summary:

**NEVER COMMIT:**
- `backend/.env`
- `backend/serviceAccountKey.json`
- `.env.local`
- `venv/`
- `node_modules/`

**Your .gitignore already protects these!** ✅

Just check `git status` before every commit.
