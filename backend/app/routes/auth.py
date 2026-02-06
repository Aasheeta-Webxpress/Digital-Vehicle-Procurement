"""
Authentication Routes - User registration and login endpoints
"""
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPAuthorizationCredentials
import logging

from app.models.user import UserRegistration, UserLogin, LoginResponse
from app.services.auth_service import auth_service
from app.middleware.auth import security, get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(registration: UserRegistration):
    """
    Register a new user
    
    Flow:
    1. Validate input data
    2. Check if email exists
    3. Generate userId
    4. Hash password
    5. Save user profile in user_master collection
    """
    result = await auth_service.register_user(registration)
    
    if not result.get('success'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get('message', 'Registration failed')
        )
    
    return {
        "success": True,
        "message": result.get('message'),
        "data": {
            "userId": result.get('userId'),
            "email": result.get('email')
        }
    }


@router.post("/login", response_model=LoginResponse)
async def login(login_data: UserLogin):
    """
    Login user with email and password
    
    Flow:
    1. Find user by email
    2. Verify password hash
    3. Check if isActive = true
    4. Return user data with JWT token
    """
    result = await auth_service.login_user(login_data)
    
    if not result.get('success'):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result.get('message', 'Invalid credentials')
        )
    
    return LoginResponse(
        success=True,
        message=result.get('message'),
        user=result.get('user'),
        token=result.get('token')
    )


@router.get("/me")
async def get_current_user_info(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Get current authenticated user information
    
    Requires: Bearer token in Authorization header
    """
    user_data = await get_current_user(credentials)
    
    return {
        "success": True,
        "user": {
            "userId": user_data.get('userId'),
            "emailId": user_data.get('emailId'),
            "userType": user_data.get('userType'),
            "mobileNo": user_data.get('mobileNo'),
            "companyCode": user_data.get('companyCode'),
            "userStatus": user_data.get('userStatus'),
            "isActive": user_data.get('isActive')
        }
    }


@router.post("/verify-token")
async def verify_user_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verify if the provided token is valid
    
    Requires: Bearer token in Authorization header
    """
    decoded_token = await auth_service.verify_token(credentials.credentials)
    
    if not decoded_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    return {
        "success": True,
        "message": "Token is valid",
        "email": decoded_token.get('sub'),
        "userType": decoded_token.get('userType'),
        "userId": decoded_token.get('userId')
    }
