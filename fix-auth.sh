#!/bin/bash
# ========================================
# AUTOMATIC AUTH FIX SCRIPT
# Run this on the server: bash fix-auth.sh
# ========================================

set -e

echo "🔥 TVS PROCUREMENT - EMERGENCY AUTH FIX"
echo "========================================"
echo ""

# Navigate to backend
echo "📁 Navigating to backend..."
cd /opt/digital-procurement/backend/app || {
    echo "❌ ERROR: Backend not found at /opt/digital-procurement/backend/app"
    exit 1
}

echo "✅ Backend directory found"
echo ""

# Backup old files
echo "💾 Backing up old auth files..."
cp services/auth_service.py services/auth_service.py.bak 2>/dev/null || true
cp routes/auth.py routes/auth.py.bak 2>/dev/null || true
cp middleware/auth.py middleware/auth.py.bak 2>/dev/null || true
echo "✅ Backups created"
echo ""

# Replace auth_service.py
echo "📝 Updating auth_service.py..."
cat > services/auth_service.py << 'AUTHSERVICE'
"""
Authentication Service - FIXED for user_master Collection
Uses custom JWT with Firestore user_master data (NO Firebase Auth)
"""
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
from google.cloud.firestore_v1.base_query import FieldFilter

from app.services.firebase_service import firebase_service
from app.models.user import UserRegistration, UserLogin, UserMaster, UserResponse
from app.config import settings

logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


class AuthService:
    """Custom JWT Auth using user_master collection"""
    
    def __init__(self):
        self.db = firebase_service.db
        if not self.db:
            logger.warning("⚠️  Firebase not connected")

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password"""
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain: str, hashed: str) -> bool:
        """Verify password"""
        return pwd_context.verify(plain, hashed)

    @staticmethod
    def create_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(hours=24)
        
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)

    async def register(self, reg: UserRegistration) -> Dict[str, Any]:
        """Register new user in user_master"""
        try:
            if not self.db:
                return {"success": False, "message": "Database offline"}
            
            users = self.db.collection('user_master')
            existing = list(users.where(
                filter=FieldFilter('emailId', '==', reg.username)
            ).stream())
            
            if existing:
                return {"success": False, "message": "Email already registered"}
            
            all_users = list(users.stream())
            max_num = 0
            for doc in all_users:
                uid = doc.get('userId', '')
                if uid.startswith('USR'):
                    try:
                        num = int(uid[3:])
                        max_num = max(max_num, num)
                    except:
                        pass
            
            user_id = f"USR{max_num + 1:04d}"
            composite_id = f"{reg.companyCode}-{user_id}"
            
            user_doc = {
                "_id": composite_id,
                "userId": user_id,
                "emailId": reg.username,
                "userpassword": self.hash_password(reg.password),
                "mobileNo": reg.mobileNo,
                "userType": reg.userType,
                "companyCode": reg.companyCode,
                "userStatus": "Permanent",
                "isActive": True,
                "entryDate": datetime.utcnow().isoformat(),
                "firebaseUid": composite_id
            }
            
            users.document(composite_id).set(user_doc)
            
            logger.info(f"✅ Registered: {composite_id}")
            return {
                "success": True,
                "message": "Registration successful",
                "userId": user_id
            }
            
        except Exception as e:
            logger.error(f"❌ Register error: {str(e)}")
            return {"success": False, "message": str(e)}

    async def login(self, login: UserLogin) -> Dict[str, Any]:
        """Login user from user_master"""
        try:
            if not self.db:
                return {"success": False, "message": "Database offline"}
            
            users = self.db.collection('user_master')
            docs = list(users.where(
                filter=FieldFilter('emailId', '==', login.username)
            ).stream())
            
            if not docs:
                return {"success": False, "message": "Invalid credentials"}
            
            user_data = docs[0].to_dict()
            
            if not self.verify_password(login.password, user_data.get('userpassword', '')):
                return {"success": False, "message": "Invalid credentials"}
            
            if not user_data.get('isActive', False):
                return {"success": False, "message": "Account inactive"}
            
            token = self.create_token({
                "sub": user_data['emailId'],
                "userId": user_data['userId'],
                "userType": user_data['userType'],
                "companyCode": user_data['companyCode']
            })
            
            return {
                "success": True,
                "message": "Login successful",
                "token": token,
                "user": {
                    "userId": user_data['userId'],
                    "emailId": user_data['emailId'],
                    "userType": user_data['userType'],
                    "mobileNo": user_data['mobileNo'],
                    "companyCode": user_data['companyCode'],
                    "isActive": user_data['isActive']
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Login error: {str(e)}")
            return {"success": False, "message": str(e)}

    async def get_user(self, email: str) -> Optional[Dict]:
        """Get user by email"""
        try:
            if not self.db:
                return None
            
            users = self.db.collection('user_master')
            docs = list(users.where(
                filter=FieldFilter('emailId', '==', email)
            ).stream())
            
            return docs[0].to_dict() if docs else None
        except:
            return None

    async def verify_token(self, token: str) -> Optional[Dict]:
        """Verify JWT token"""
        try:
            payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
            return payload
        except:
            return None


auth_service = AuthService()
AUTHSERVICE

echo "✅ auth_service.py updated"
echo ""

# Replace routes/auth.py
echo "📝 Updating routes/auth.py..."
cat > routes/auth.py << 'AUTHROUTES'
"""
Authentication Routes - FIXED for user_master Collection
"""
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging

from app.models.user import UserRegistration, UserLogin
from app.services.auth_service import auth_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()


@router.post("/register", status_code=201)
async def register(data: UserRegistration):
    """Register new user"""
    result = await auth_service.register(data)
    
    if not result.get('success'):
        raise HTTPException(status_code=400, detail=result['message'])
    
    return result


@router.post("/login")
async def login(data: UserLogin):
    """Login user and return JWT token"""
    result = await auth_service.login(data)
    
    if not result.get('success'):
        raise HTTPException(status_code=401, detail=result['message'])
    
    return result


@router.get("/me")
async def get_me(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user info"""
    token = credentials.credentials
    payload = await auth_service.verify_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await auth_service.get_user(payload['sub'])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "success": True,
        "user": {
            "userId": user['userId'],
            "emailId": user['emailId'],
            "userType": user['userType'],
            "mobileNo": user['mobileNo'],
            "companyCode": user['companyCode'],
            "isActive": user['isActive']
        }
    }


@router.post("/verify-token")
async def verify(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token"""
    payload = await auth_service.verify_token(credentials.credentials)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return {
        "success": True,
        "valid": True,
        "userId": payload.get('userId'),
        "userType": payload.get('userType')
    }
AUTHROUTES

echo "✅ routes/auth.py updated"
echo ""

# Replace middleware/auth.py
echo "📝 Updating middleware/auth.py..."
cat > middleware/auth.py << 'AUTHMIDDLEWARE'
"""
Auth Middleware - Protect endpoints with JWT token verification
"""
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging

from app.services.auth_service import auth_service

logger = logging.getLogger(__name__)
security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Extract and verify JWT token, return user data"""
    token = credentials.credentials
    
    payload = await auth_service.verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    user = await auth_service.get_user(payload['sub'])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user.get('isActive'):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account inactive"
        )
    
    return user


async def require_customer(user: dict = Depends(get_current_user)):
    """Require Customer user type"""
    if user.get('userType') != 'Customer':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can access this"
        )
    return user


async def require_vendor(user: dict = Depends(get_current_user)):
    """Require Vendor user type"""
    if user.get('userType') != 'Vendor':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only vendors can access this"
        )
    return user
AUTHMIDDLEWARE

echo "✅ middleware/auth.py updated"
echo ""

# Restart backend
echo "🔄 Restarting backend container..."
cd /opt/digital-procurement
docker-compose -f docker-compose.prod.yml restart tvs-backend

# Wait for restart
echo "⏳ Waiting 10 seconds for container to start..."
sleep 10

echo ""
echo "========================================"
echo "✅ AUTH FIX COMPLETE!"
echo "========================================"
echo ""
echo "📊 Container Status:"
docker-compose -f docker-compose.prod.yml ps | grep tvs-backend
echo ""

echo "🔍 Testing Health Check..."
HEALTH=$(curl -s http://localhost:8020/health || echo '{"status":"error"}')
echo "Response: $HEALTH"
echo ""

if echo "$HEALTH" | grep -q "healthy"; then
    echo "✅ BACKEND IS WORKING!"
    echo ""
    echo "🌐 Access your application:"
    echo "   Frontend: http://143.110.191.22:3020"
    echo "   Backend: http://143.110.191.22:8020"
    echo "   API Docs: http://143.110.191.22:8020/docs"
else
    echo "⚠️  Backend may still be starting..."
    echo "   Check logs: docker logs -f tvs-backend"
fi

echo ""
echo "✨ Done!"
