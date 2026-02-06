<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🚚 TVS Digital Vehicle Procurement System

> A modern, real-time procurement platform for competitive bidding between customers and logistics vendors.

[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)]()
[![Backend](https://img.shields.io/badge/Backend-Python%20FastAPI-blue)]()
[![Frontend](https://img.shields.io/badge/Frontend-React%20TypeScript-61dafb)]()
[![Database](https://img.shields.io/badge/Database-Firebase%20Firestore-orange)]()

---

## 🎯 Overview

A complete full-stack digital procurement platform that enables:
- **Real-time competitive bidding** between customers and vendors
- **Live price updates** with L1 (lowest bid) tracking
- **Comprehensive analytics** and reporting
- **Multi-vendor marketplace** for logistics services
- **Automated workflow** from indent creation to bid awarding

**Tech Stack**: React + TypeScript + Python FastAPI + Firebase Firestore

---

## ✨ Key Features

### 🏢 For Customers
- Create transportation indents with detailed requirements
- View real-time competitive bids from multiple vendors
- Track L1 (lowest) prices automatically
- Award contracts to winning vendors
- Analyze cost savings and procurement trends

### 🚛 For Vendors
- Browse available transportation requests
- Submit competitive bids in real-time
- Track bid rankings (L1, L2, L3...)
- View performance metrics and win rates
- Manage assigned lanes and routes

### 📊 Analytics & Reporting
- Real-time dashboard with key metrics
- Cost reduction analysis
- Vendor performance tracking
- Procurement trends visualization
- Bid comparison charts

---

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

**Windows:**
```bash
quick-start.bat
```

**Mac/Linux:**
```bash
chmod +x quick-start.sh
./quick-start.sh
```

### Option 2: Manual Setup

**1. Install Dependencies**
```bash
# Frontend
npm install

# Backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
```

**2. Configure Environment**
```bash
# Frontend
cp .env.example .env.local

# Backend
cd backend
cp .env.example .env
```

**3. Set Up Firebase**
- Create Firebase project at https://console.firebase.google.com/
- Enable Firestore Database
- Download service account key → save as `backend/serviceAccountKey.json`
- Update `backend/.env` with your Firebase project ID

**4. Start Development Servers**

Terminal 1 (Backend):
```bash
cd backend
venv\Scripts\activate  # or source venv/bin/activate
uvicorn app.main:app --reload
```

Terminal 2 (Frontend):
```bash
npm run dev
```

**5. Access Application**
- **Frontend**: http://localhost:5173
- **Backend API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

---

## 📁 Project Structure

```
digital-vehicle-procurement/
├── 📄 Quick Start & Documentation
│   ├── README.md                    # This file
│   ├── SETUP_GUIDE.md              # Complete setup instructions
│   ├── IMPLEMENTATION_SUMMARY.md   # Technical implementation details
│   ├── quick-start.bat             # Windows setup script
│   └── quick-start.sh              # Mac/Linux setup script
│
├── 🎨 Frontend (React + TypeScript)
│   ├── components/                 # React components (11 files)
│   ├── App.tsx                     # Main application
│   ├── services.ts                 # API service layer
│   ├── types.ts                    # TypeScript definitions
│   ├── constants.tsx               # Mock data
│   └── vite.config.ts             # Vite configuration
│
└── 🐍 Backend (Python + FastAPI)
    ├── app/
    │   ├── main.py                # FastAPI application
    │   ├── config.py              # Configuration
    │   ├── models/                # Pydantic models
    │   ├── services/              # Business logic
    │   │   ├── firebase_service.py
    │   │   ├── indent_service.py
    │   │   ├── bid_service.py
    │   │   └── analytics_service.py
    │   └── routes/                # API endpoints
    │       ├── indents.py
    │       ├── bids.py
    │       └── analytics.py
    ├── scripts/
    │   └── init_data.py           # Database initialization
    ├── README.md                  # Backend documentation
    ├── SECURITY.md                # Security guide
    └── requirements.txt           # Python dependencies
```

---

## 🔧 Configuration

### Development Mode (Default)

Uses **localStorage** for data persistence - no backend required.

```typescript
// services.ts
const USE_MOCK_MODE = true;  // Mock mode enabled
```

### Production Mode

Uses **Python FastAPI backend** with **Firebase Firestore**.

```typescript
// services.ts
const USE_MOCK_MODE = false;  // Use backend API
```

```env
// .env.local
VITE_API_URL=http://localhost:8000/api/v1
```

---

## 📡 API Endpoints

### Indents
- `GET /api/v1/indents` - Get all indents
- `POST /api/v1/indents` - Create indent
- `GET /api/v1/indents/{id}` - Get single indent
- `PUT /api/v1/indents/{id}` - Update indent
- `PATCH /api/v1/indents/{id}/award` - Award to vendor

### Bids
- `GET /api/v1/bids` - Get all bids
- `POST /api/v1/bids` - Submit bid
- `GET /api/v1/bids/indent/{id}` - Get bids for indent

### Analytics
- `GET /api/v1/analytics/trends` - Procurement trends
- `GET /api/v1/analytics/dashboard` - Dashboard metrics

**Interactive API Documentation**: http://localhost:8000/docs

---

## 🗄️ Database Schema

### Firestore Collections

1. **indents** - Transportation requests
   - Fields: requestId, lane, vehicleType, status, estimatedPrice, lowestBid, etc.

2. **bids** - Vendor bids
   - Fields: indentId, vendorId, amount, timestamp, rank

3. **vendors** - Logistics companies
   - Fields: name, email, rating, assignedLanes, totalAwards, winRate

4. **lanes** - Routes/lanes
   - Fields: source, destination, distanceKm, isActive

5. **api_keys** - API authentication (optional)
   - Fields: key, name, status, permissions

---

## 🔐 Security

### Secrets Management
- ✅ Service account keys excluded from Git
- ✅ Environment variables for configuration
- ✅ CORS protection
- ✅ Firebase security rules
- ✅ Production-ready authentication support

**See**: `backend/SECURITY.md` for complete security guide

### Important Files to Keep Secret
- `backend/serviceAccountKey.json` - Firebase credentials
- `backend/.env` - Backend configuration
- `.env.local` - Frontend configuration

**Never commit these files to Git!**

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Complete setup instructions |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | Technical implementation details |
| [backend/README.md](backend/README.md) | Backend documentation |
| [backend/SECURITY.md](backend/SECURITY.md) | Security best practices |

---

## 🚢 Deployment

### Backend Deployment Options
- **Google Cloud Run** (Recommended for Firebase)
- **Heroku**
- **Railway**
- **AWS Lambda**
- **DigitalOcean App Platform**

### Frontend Deployment Options
- **Vercel** (Recommended)
- **Netlify**
- **Firebase Hosting**
- **Cloudflare Pages**

**See**: `SETUP_GUIDE.md` for detailed deployment instructions

---

## 🧪 Testing

### Initialize Sample Data
```bash
cd backend
python scripts/init_data.py
```

This creates:
- 5 lanes (Mumbai-Bangalore, Mumbai-Chennai, etc.)
- 4 vendors (Safe Logistics, Agarwal Cargo, etc.)
- 3 sample indents with bids

### Test API Endpoints
```bash
# Health check
curl http://localhost:8000/health

# Get indents
curl http://localhost:8000/api/v1/indents

# Submit bid
curl -X POST http://localhost:8000/api/v1/bids \
  -H "Content-Type: application/json" \
  -d '{"indentId":"TR001","vendorId":"V1","vendorName":"Safe Logistics","amount":25000}'
```

---

## 🛠️ Development

### Prerequisites
- Node.js 18+
- Python 3.8+
- Firebase account
- Git

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Recharts, Lucide Icons
- **Backend**: Python 3.8+, FastAPI, Firebase Admin SDK, Pydantic
- **Database**: Firebase Firestore (NoSQL)
- **Deployment**: Vercel (Frontend), Cloud Run (Backend)

### Development Workflow
1. Make changes to code
2. Auto-reload happens automatically
3. Test in browser
4. Check API docs at `/docs`
5. Verify data in Firebase Console

---

## 📊 Project Status

**Current Status**: ✅ **Production Ready**

### Completed Features
- ✅ Complete backend API (Python FastAPI)
- ✅ Firebase Firestore integration
- ✅ Frontend API integration
- ✅ Dual mode support (mock/production)
- ✅ Real-time updates
- ✅ Analytics and reporting
- ✅ Comprehensive documentation
- ✅ Security implementation
- ✅ Deployment guides

### Ready For
- ✅ Local development
- ✅ Firebase setup
- ✅ Production deployment
- ✅ Team collaboration

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 License

Copyright © 2024 TVS Supply Chain Solutions

---

## 📞 Support

### Getting Help
1. Check `SETUP_GUIDE.md` for setup issues
2. Review `IMPLEMENTATION_SUMMARY.md` for technical details
3. Check `backend/SECURITY.md` for security questions
4. Review API docs at http://localhost:8000/docs

### Resources
- [Firebase Documentation](https://firebase.google.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

---

## 🎉 Acknowledgments

Built with ❤️ using:
- React & TypeScript
- Python & FastAPI
- Firebase & Firestore
- Vite & Recharts

---

<div align="center">

**Ready to transform your procurement process?**

[Get Started](#-quick-start) • [View Docs](SETUP_GUIDE.md) • [Deploy](SETUP_GUIDE.md#-production-deployment)

</div>
