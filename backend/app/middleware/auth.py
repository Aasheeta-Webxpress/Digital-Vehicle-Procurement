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
    
    # Verify token
    payload = await auth_service.verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    # Get user from database
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
