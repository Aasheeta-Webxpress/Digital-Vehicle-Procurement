# TVS Procurement - Python Backend

Backend API for the Digital Vehicle Procurement System built with FastAPI and Firebase Firestore.

## 🏗️ Architecture

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application
│   ├── config.py               # Configuration management
│   ├── models/
│   │   └── __init__.py         # Pydantic models
│   ├── services/
│   │   ├── __init__.py
│   │   ├── firebase_service.py # Firebase client
│   │   ├── indent_service.py   # Indent business logic
│   │   ├── bid_service.py      # Bid business logic
│   │   └── analytics_service.py# Analytics logic
│   └── routes/
│       ├── __init__.py
│       ├── indents.py          # Indent endpoints
│       ├── bids.py             # Bid endpoints
│       └── analytics.py        # Analytics endpoints
├── scripts/
│   └── init_data.py            # Data initialization
├── .env.example                # Environment template
├── .gitignore
├── requirements.txt
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- Firebase project with Firestore enabled
- Service account key from Firebase

### 1. Install Dependencies

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy environment template
copy .env.example .env

# Edit .env file with your configuration
```

**Required Environment Variables:**

```env
# Firebase Configuration
FIREBASE_CREDENTIALS_PATH=./serviceAccountKey.json
FIREBASE_PROJECT_ID=your-firebase-project-id

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

### 3. Add Firebase Credentials

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Save it as `serviceAccountKey.json` in the `backend/` directory
5. **IMPORTANT**: Never commit this file to Git (it's in `.gitignore`)

### 4. Initialize Database (Optional)

Populate Firebase with mock data:

```bash
python scripts/init_data.py
```

This creates:
- 5 lanes (routes)
- 4 vendors
- 3 sample indents

### 5. Run the Server

```bash
# Development mode (with auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or using Python
python -m app.main
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📡 API Endpoints

### Indents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/indents` | Get all indents |
| GET | `/api/v1/indents/{id}` | Get single indent |
| POST | `/api/v1/indents` | Create new indent |
| PUT | `/api/v1/indents/{id}` | Update indent |
| DELETE | `/api/v1/indents/{id}` | Delete indent |
| PATCH | `/api/v1/indents/{id}/award` | Award indent to vendor |

### Bids

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/bids` | Get all bids |
| POST | `/api/v1/bids` | Submit new bid |
| GET | `/api/v1/bids/indent/{id}` | Get bids for indent |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/analytics/trends` | Get procurement trends |
| GET | `/api/v1/analytics/dashboard` | Get dashboard metrics |

## 🔧 Configuration

### Environment Variables

All configuration is managed through environment variables in `.env`:

- **FIREBASE_CREDENTIALS_PATH**: Path to service account key
- **FIREBASE_PROJECT_ID**: Your Firebase project ID
- **API_HOST**: Server host (default: 0.0.0.0)
- **API_PORT**: Server port (default: 8000)
- **CORS_ORIGINS**: Allowed origins (comma-separated)
- **ENVIRONMENT**: development/production
- **DEBUG**: Enable debug mode

### Security Best Practices

1. **Never commit credentials**:
   - `serviceAccountKey.json` is in `.gitignore`
   - Never commit `.env` file

2. **Use environment-specific configs**:
   - `.env` for development
   - `.env.production` for production
   - Set environment variables in deployment platform

3. **Secure API keys**:
   - Use Firebase security rules
   - Implement API key authentication
   - Enable HTTPS in production

## 🗄️ Database Schema

### Collections

1. **indents** - Transportation requests
2. **bids** - Vendor bids
3. **vendors** - Logistics companies
4. **lanes** - Routes/lanes
5. **api_keys** - API authentication (optional)

See `implementation_plan.md` for detailed schema.

## 🧪 Testing

### Test Firebase Connection

```bash
python scripts/test_connection.py
```

### Test API Endpoints

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

## 📊 Monitoring & Logging

The application includes:
- Request/response logging
- Error tracking
- Performance metrics
- Firebase connection status

Logs are output to console in development mode.

## 🚢 Deployment

### Production Checklist

- [ ] Set `ENVIRONMENT=production` in `.env`
- [ ] Set `DEBUG=False`
- [ ] Configure production CORS origins
- [ ] Use production Firebase project
- [ ] Set up HTTPS
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerts
- [ ] Enable Firebase security rules

### Deployment Options

1. **Google Cloud Run** (Recommended for Firebase)
2. **AWS Lambda** (with API Gateway)
3. **Heroku**
4. **Railway**
5. **DigitalOcean App Platform**

## 🔐 Secrets Management

### Development

Store secrets in `.env` file (never commit):

```env
FIREBASE_CREDENTIALS_PATH=./serviceAccountKey.json
```

### Production

Use platform-specific secret management:

**Google Cloud Run:**
```bash
gcloud secrets create firebase-key --data-file=serviceAccountKey.json
```

**AWS:**
Use AWS Secrets Manager or Parameter Store

**Heroku:**
```bash
heroku config:set FIREBASE_CREDENTIALS_PATH=/app/secrets/key.json
```

**Railway:**
Use Railway's environment variables UI

## 📝 Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes and test**
   ```bash
   uvicorn app.main:app --reload
   ```

3. **Test endpoints**
   - Use http://localhost:8000/docs
   - Or use Postman/curl

4. **Commit and push**
   ```bash
   git add .
   git commit -m "Add feature"
   git push origin feature/your-feature
   ```

## 🐛 Troubleshooting

### Firebase not connected

**Error**: `Firebase not connected - Running in mock mode`

**Solution**:
1. Check `serviceAccountKey.json` exists
2. Verify `FIREBASE_CREDENTIALS_PATH` in `.env`
3. Ensure Firebase project ID is correct

### CORS errors

**Error**: `Access blocked by CORS policy`

**Solution**:
1. Add frontend URL to `CORS_ORIGINS` in `.env`
2. Restart the server

### Import errors

**Error**: `ModuleNotFoundError`

**Solution**:
1. Activate virtual environment
2. Install dependencies: `pip install -r requirements.txt`

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Pydantic Documentation](https://docs.pydantic.dev/)

## 🤝 Support

For issues or questions:
1. Check the implementation plan
2. Review Firebase console for errors
3. Check application logs
4. Test with API documentation at `/docs`

## 📄 License

Copyright © 2024 TVS Supply Chain Solutions
