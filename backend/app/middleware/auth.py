"""
Authentication Middleware - Token verification and role-based access
"""
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, List
import logging

from app.services.auth_service import auth_service

logger = logging.getLogger(__name__)

security = HTTPBearer()


async def verify_token(credentials: HTTPAuthorizationCredentials) -> dict:
    """Verify JWT token"""
    token = credentials.credentials
    
    decoded_token = await auth_service.verify_token(token)
    if not decoded_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    return decoded_token


async def get_current_user(credentials: HTTPAuthorizationCredentials) -> dict:
    """Get current authenticated user"""
    decoded_token = await verify_token(credentials)
    
    # Fetch user data from Firestore using email (sub)
    email = decoded_token.get('sub')
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    user_data = await auth_service.get_user_by_email(email)
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user_data.get('isActive', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )
    
    return user_data


async def require_role(user_data: dict, allowed_roles: List[str]):
    """Check if user has required role"""
    user_type = user_data.get('userType')
    
    if user_type not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied. Required roles: {', '.join(allowed_roles)}"
        )


class RoleChecker:
    """Dependency for role-based access control"""
    
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles
    
    async def __call__(self, credentials: HTTPAuthorizationCredentials):
        user_data = await get_current_user(credentials)
        await require_role(user_data, self.allowed_roles)
        return user_data


# Role-based dependencies
require_customer = RoleChecker(["Customer"])
require_vendor = RoleChecker(["Vendor"])
require_any_user = RoleChecker(["Customer", "Vendor"])
