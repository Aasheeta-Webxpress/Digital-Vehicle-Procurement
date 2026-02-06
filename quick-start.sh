#!/bin/bash
# Quick Start Script for TVS Procurement System (Mac/Linux)
# This script helps set up the development environment

echo "========================================"
echo "TVS Procurement System - Quick Start"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.8+ from https://www.python.org/"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "[1/6] Checking prerequisites..."
echo "  - Python: OK"
echo "  - Node.js: OK"
echo ""

echo "[2/6] Setting up backend..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "  - Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install backend dependencies
echo "  - Installing Python dependencies..."
pip install -r requirements.txt > /dev/null 2>&1

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "  - Creating .env file from template..."
    cp .env.example .env
    echo "  WARNING: Please edit backend/.env with your Firebase credentials"
fi

# Check if serviceAccountKey.json exists
if [ ! -f "serviceAccountKey.json" ]; then
    echo "  WARNING: serviceAccountKey.json not found"
    echo "  Please download from Firebase Console and place in backend/"
fi

cd ..
echo "  - Backend setup complete"
echo ""

echo "[3/6] Setting up frontend..."
# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "  - Installing npm dependencies..."
    npm install
else
    echo "  - Dependencies already installed"
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "  - Creating .env.local file from template..."
    cp .env.example .env.local
fi

echo "  - Frontend setup complete"
echo ""

echo "[4/6] Checking configuration..."
echo "  - Backend .env: $(pwd)/backend/.env"
echo "  - Frontend .env.local: $(pwd)/.env.local"
echo "  - Firebase credentials: $(pwd)/backend/serviceAccountKey.json"
echo ""

echo "[5/6] Setup Summary"
echo "========================================"
echo ""
echo "NEXT STEPS:"
echo ""
echo "1. Set up Firebase:"
echo "   - Go to https://console.firebase.google.com/"
echo "   - Create a new project"
echo "   - Enable Firestore Database"
echo "   - Download service account key"
echo ""
echo "2. Configure Backend:"
echo "   - Edit backend/.env"
echo "   - Add your Firebase project ID"
echo "   - Place serviceAccountKey.json in backend/"
echo ""
echo "3. Start Development Servers:"
echo "   - Terminal 1: cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "   - Terminal 2: npm run dev"
echo ""
echo "4. Access Application:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend API: http://localhost:8000/docs"
echo ""
echo "For detailed instructions, see SETUP_GUIDE.md"
echo ""

echo "[6/6] Setup complete!"
echo ""
