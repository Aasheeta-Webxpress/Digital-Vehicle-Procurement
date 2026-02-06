# 🏗️ Deployment Architecture Diagram

## TVS Procurement System - Production Deployment

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          GITHUB REPOSITORY                              │
│                   Source Code + CI/CD Pipeline                          │
│                  github.com/YOUR-USERNAME/Digital-Vehicle-Procurement   │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               │ Push to main branch
                               │ Triggers GitHub Actions
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       GITHUB ACTIONS RUNNER                             │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Step 1: 📥 Checkout Code                                         │  │
│  ├───────────────────────────────────────────────────────────────────┤  │
│  │  Step 2: 🔧 Setup Node.js 18 & Python 3.12                        │  │
│  ├───────────────────────────────────────────────────────────────────┤  │
│  │  Step 3: 📦 Install Dependencies (npm ci, pip install)            │  │
│  ├───────────────────────────────────────────────────────────────────┤  │
│  │  Step 4: 🧪 Run Tests & Linting                                   │  │
│  ├───────────────────────────────────────────────────────────────────┤  │
│  │  Step 5: 🏗️ Build Frontend (npm run build)                        │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               │ SSH Connection
                               │ (Private Key Authentication)
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    PRODUCTION SERVER: 143.110.191.22                    │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    NGINX (Port 80/443)                            │  │
│  │                Reverse Proxy & Load Balancer                      │  │
│  │                      SSL/TLS Termination                          │  │
│  └─────────────┬──────────────────────────────┬──────────────────────┘  │
│                │                              │                         │
│                │                              │                         │
│       ┌────────▼────────┐          ┌─────────▼──────────┐              │
│       │                 │          │                    │              │
│       │  FRONTEND       │          │    BACKEND         │              │
│       │  Port: 3000     │          │    Port: 8000      │              │
│       │                 │          │                    │              │
│       │  ⚛️ React 18     │          │    🐍 Python 3.12   │              │
│       │  📦 Vite Build   │          │    ⚡ FastAPI       │              │
│       │  🔄 PM2 Managed  │          │    🦄 Uvicorn      │              │
│       │                 │          │    🔄 PM2 Managed   │              │
│       │  Static Files   │          │                    │              │
│       │  Served by      │          │    API Endpoints:  │              │
│       │  'serve' pkg    │          │    /api/v1/*       │              │
│       │                 │          │    /docs           │              │
│       │  Routes:        │          │    /health         │              │
│       │  /              │          │                    │              │
│       │  /dashboard     │          │                    │              │
│       │  /indents       │          │                    │              │
│       │  /bids          │          │                    │              │
│       │                 │          │                    │              │
│       └─────────────────┘          └──────────┬─────────┘              │
│                                               │                         │
│                                               │                         │
│                                    ┌──────────▼──────────┐              │
│                                    │  Firebase Creds     │              │
│                                    │  📄 .env            │              │
│                                    │  🔑 serviceAccount  │              │
│                                    │     Key.json        │              │
│                                    └─────────────────────┘              │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                     PROCESS MANAGER (PM2)                         │  │
│  │  ┌──────────────────┐  ┌──────────────────┐                      │  │
│  │  │  tvs-frontend    │  │  tvs-backend     │                      │  │
│  │  │  Status: online  │  │  Status: online  │                      │  │
│  │  │  Uptime: 24h     │  │  Uptime: 24h     │                      │  │
│  │  │  Restarts: 0     │  │  Restarts: 0     │                      │  │
│  │  │  Memory: 150MB   │  │  Memory: 250MB   │                      │  │
│  │  └──────────────────┘  └──────────────────┘                      │  │
│  │  Auto-restart on crash | Log rotation | Monitoring               │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                        FIREWALL (UFW)                             │  │
│  │  ✅ Port 22   - SSH                                               │  │
│  │  ✅ Port 80   - HTTP (Nginx)                                      │  │
│  │  ✅ Port 443  - HTTPS (Nginx)                                     │  │
│  │  ✅ Port 3000 - Frontend (Direct Access)                          │  │
│  │  ✅ Port 8000 - Backend (Direct Access)                           │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             │ HTTPS API Calls
                             │ (Firebase Admin SDK)
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        FIREBASE CLOUD (External)                        │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    🔥 Firebase Services                           │  │
│  │  ┌──────────────────────────────────────────────────────────────┐ │  │
│  │  │  Firestore Database                                          │ │  │
│  │  │  Project: controltower-1099                                  │ │  │
│  │  │  Region: asia-south1                                         │ │  │
│  │  │                                                              │ │  │
│  │  │  Collections:                                                │ │  │
│  │  │  ├── indents (Transportation requests)                       │ │  │
│  │  │  ├── bids (Vendor bids)                                      │ │  │
│  │  │  ├── vendors (Logistics companies)                           │ │  │
│  │  │  ├── lanes (Routes/lanes)                                    │ │  │
│  │  │  └── api_keys (API authentication)                           │ │  │
│  │  └──────────────────────────────────────────────────────────────┘ │  │
│  │  ┌──────────────────────────────────────────────────────────────┐ │  │
│  │  │  Authentication (Optional)                                   │ │  │
│  │  │  - Email/Password                                            │ │  │
│  │  │  - Google Sign-In                                            │ │  │
│  │  └──────────────────────────────────────────────────────────────┘ │  │
│  │  ┌──────────────────────────────────────────────────────────────┐ │  │
│  │  │  Security Rules                                              │ │  │
│  │  │  - Role-based access control                                 │ │  │
│  │  │  - Data validation                                           │ │  │
│  │  └──────────────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🌐 Access URLs

### Without Nginx (Direct Access):
- **Frontend**: http://143.110.191.22:3000
- **Backend API**: http://143.110.191.22:8000/docs
- **Health Check**: http://143.110.191.22:8000/health

### With Nginx (Recommended):
- **Frontend**: http://143.110.191.22
- **Backend API**: http://143.110.191.22/api/v1/*
- **API Docs**: http://143.110.191.22/docs
- **Health Check**: http://143.110.191.22/health

---

## 🔄 Deployment Flow

```
Developer → Git Push → GitHub → Actions → SSH → Server → PM2 → Live
    │                    │         │        │       │       │
    │                    │         │        │       │       └─→ Frontend:3000
    │                    │         │        │       │       └─→ Backend:8000
    │                    │         │        │       │
    │                    │         │        │       └─→ Restart Services
    │                    │         │        │
    │                    │         │        └─→ Pull Code, Build, Deploy
    │                    │         │
    │                    │         └─→ Test, Build, Package
    │                    │
    │                    └─→ Trigger Workflow
    │
    └─→ Commit & Push to main
```

---

## 📊 Port Allocation Summary

| Port | Service | Protocol | Access |
|------|---------|----------|--------|
| 22 | SSH | TCP | Admin only |
| 80 | Nginx HTTP | TCP | Public |
| 443 | Nginx HTTPS | TCP | Public |
| 3000 | Frontend | TCP | Public |
| 8000 | Backend API | TCP | Public |

---

## 🔐 Security Layers

1. **Firewall (UFW)**: Port-level access control
2. **Nginx**: Reverse proxy, rate limiting, SSL termination
3. **PM2**: Process isolation, auto-restart
4. **Firebase**: Authentication, security rules
5. **Environment Variables**: Secrets management
6. **SSH Keys**: Secure deployment access

---

## 📈 Scalability Options

### Horizontal Scaling:
- Add more server instances
- Load balancer in front
- Database replication

### Vertical Scaling:
- Increase server resources
- Optimize PM2 instances
- Enable clustering

---

## 🔄 High Availability Setup (Future)

```
         ┌─────────────┐
         │ Load Balancer│
         └──────┬───────┘
                │
        ┌───────┴───────┐
        │               │
   ┌────▼────┐    ┌────▼────┐
   │ Server 1│    │ Server 2│
   │ :3000   │    │ :3000   │
   │ :8000   │    │ :8000   │
   └────┬────┘    └────┬────┘
        │               │
        └───────┬───────┘
                │
         ┌──────▼──────┐
         │  Firebase   │
         │  (Shared)   │
         └─────────────┘
```

---

**Architecture Version**: 1.0  
**Last Updated**: 2026-02-06  
**Status**: Production Ready 🚀
