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
