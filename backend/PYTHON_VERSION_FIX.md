# ⚠️ IMPORTANT: Python 3.15 Compatibility Issue

## Problem
Python 3.15 is too new and doesn't have pre-compiled wheels for `pydantic-core`, which requires Rust to compile from source.

## Solutions

### Option 1: Use Python 3.11 or 3.12 (RECOMMENDED)

1. **Download Python 3.12**:
   - Go to https://www.python.org/downloads/
   - Download Python 3.12.x (latest stable)
   - Install it

2. **Create new virtual environment**:
   ```bash
   # Remove old venv
   rm -r venv  # or: rmdir /s venv on Windows
   
   # Create new venv with Python 3.12
   python3.12 -m venv venv
   
   # Activate
   venv\Scripts\activate  # Windows
   # or: source venv/bin/activate  # Mac/Linux
   
   # Install dependencies
   pip install -r requirements.txt
   ```

### Option 2: Install Rust (if you want to keep Python 3.15)

1. **Install Rust**:
   - Go to https://rustup.rs/
   - Download and run the installer
   - Follow the installation prompts
   - Restart your terminal

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

### Option 3: Use Docker (Alternative)

Create `Dockerfile`:
```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Run:
```bash
docker build -t tvs-backend .
docker run -p 8000:8000 tvs-backend
```

## Recommended Action

**Use Python 3.12** - it's the most stable and has all pre-compiled wheels available.

```bash
# Quick fix:
1. Download Python 3.12 from python.org
2. Delete current venv folder
3. Create new venv: python3.12 -m venv venv
4. Activate: venv\Scripts\activate
5. Install: pip install -r requirements.txt
6. Run: uvicorn app.main:app --reload
```

## Why This Happens

- Python 3.15 was just released
- Package maintainers haven't built wheels for it yet
- `pydantic-core` is written in Rust and needs compilation
- Pre-built wheels avoid needing Rust installed

## Current Status

- ❌ Python 3.15 - Not compatible (no wheels)
- ✅ Python 3.12 - Fully compatible (recommended)
- ✅ Python 3.11 - Fully compatible
- ✅ Python 3.10 - Compatible
