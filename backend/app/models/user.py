"""
User Models - Pydantic schemas for user management
"""
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, Literal
from datetime import datetime
import re


class UserRegistration(BaseModel):
    """User registration request model"""
    username: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=8, description="User password")
    userType: Literal["Customer", "Vendor"] = Field(..., description="User type")
    mobileNo: str = Field(..., description="Mobile number")
    companyCode: int = Field(..., description="Company code")
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one digit')
        if not re.search(r'[@$!%*?&#]', v):
            raise ValueError('Password must contain at least one special character (@$!%*?&#)')
        return v
    
    @field_validator('mobileNo')
    @classmethod
    def validate_mobile(cls, v):
        """Validate mobile number"""
        if not re.match(r'^\d{10}$', v):
            raise ValueError('Mobile number must be exactly 10 digits')
        return v


class UserLogin(BaseModel):
    """User login request model"""
    username: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")


class UserMaster(BaseModel):
    """
    User Master model for Firestore storage
    Uses Field alias to handle Firestore's _id field
    """
    id: str = Field(..., alias="_id", description="Composite ID: companyCode-userId")
    userId: str = Field(..., description="Unique user ID")
    userStatus: str = Field(default="Permanent", description="User status")
    userType: Literal["Customer", "Vendor"] = Field(..., description="User type")
    mobileNo: str = Field(..., description="Mobile number")
    emailId: EmailStr = Field(..., description="Email address")
    isActive: bool = Field(default=True, description="Active status")
    entryDate: datetime = Field(default_factory=datetime.utcnow, description="Entry timestamp")
    companyCode: int = Field(..., description="Company code")
    firebaseUid: str = Field(..., description="Firebase Auth UID")
    
    model_config = {
        "populate_by_name": True,  # Allow both 'id' and '_id'
        "json_encoders": {
            datetime: lambda v: v.isoformat()
        }
    }


class UserResponse(BaseModel):
    """User response model (without sensitive data)"""
    userId: str
    userType: str
    mobileNo: str
    emailId: str
    isActive: bool
    companyCode: int
    userStatus: str
    entryDate: str


class LoginResponse(BaseModel):
    """Login response model"""
    success: bool
    message: str
    user: Optional[UserResponse] = None
    token: str
    refreshToken: Optional[str] = None
