@echo off
REM Quick Start Script for TVS Procurement System
REM This script helps set up the development environment

echo ========================================
echo TVS Procurement System - Quick Start
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/6] Checking prerequisites...
echo   - Python: OK
echo   - Node.js: OK
echo.

echo [2/6] Setting up backend...
cd backend

REM Check if virtual environment exists
if not exist "venv" (
    echo   - Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate

REM Install backend dependencies
echo   - Installing Python dependencies...
pip install -r requirements.txt >nul 2>&1

REM Check if .env exists
if not exist ".env" (
    echo   - Creating .env file from template...
    copy .env.example .env >nul
    echo   WARNING: Please edit backend/.env with your Firebase credentials
)

REM Check if serviceAccountKey.json exists
if not exist "serviceAccountKey.json" (
    echo   WARNING: serviceAccountKey.json not found
    echo   Please download from Firebase Console and place in backend/
)

cd ..
echo   - Backend setup complete
echo.

echo [3/6] Setting up frontend...
REM Check if node_modules exists
if not exist "node_modules" (
    echo   - Installing npm dependencies...
    call npm install
) else (
    echo   - Dependencies already installed
)

REM Check if .env.local exists
if not exist ".env.local" (
    echo   - Creating .env.local file from template...
    copy .env.example .env.local >nul
)

echo   - Frontend setup complete
echo.

echo [4/6] Checking configuration...
echo   - Backend .env: %CD%\backend\.env
echo   - Frontend .env.local: %CD%\.env.local
echo   - Firebase credentials: %CD%\backend\serviceAccountKey.json
echo.

echo [5/6] Setup Summary
echo ========================================
echo.
echo NEXT STEPS:
echo.
echo 1. Set up Firebase:
echo    - Go to https://console.firebase.google.com/
echo    - Create a new project
echo    - Enable Firestore Database
echo    - Download service account key
echo.
echo 2. Configure Backend:
echo    - Edit backend/.env
echo    - Add your Firebase project ID
echo    - Place serviceAccountKey.json in backend/
echo.
echo 3. Start Development Servers:
echo    - Terminal 1: cd backend ^&^& venv\Scripts\activate ^&^& uvicorn app.main:app --reload
echo    - Terminal 2: npm run dev
echo.
echo 4. Access Application:
echo    - Frontend: http://localhost:5173
echo    - Backend API: http://localhost:8000/docs
echo.
echo For detailed instructions, see SETUP_GUIDE.md
echo.

echo [6/6] Setup complete!
echo.
pause
