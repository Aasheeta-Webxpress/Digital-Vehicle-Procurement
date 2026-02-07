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
            
            # Check if email exists
            users = self.db.collection('user_master')
            existing = list(users.where(
                filter=FieldFilter('emailId', '==', reg.username)
            ).stream())
            
            if existing:
                return {"success": False, "message": "Email already registered"}
            
            # Generate userId (USRxxxx format)
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
            
            # Create user document
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
            
            # Save to Firestore
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
            
            # Find user by email
            users = self.db.collection('user_master')
            docs = list(users.where(
                filter=FieldFilter('emailId', '==', login.username)
            ).stream())
            
            if not docs:
                return {"success": False, "message": "Invalid credentials"}
            
            user_data = docs[0].to_dict()
            
            # Verify password
            if not self.verify_password(login.password, user_data.get('userpassword', '')):
                return {"success": False, "message": "Invalid credentials"}
            
            # Check active
            if not user_data.get('isActive', False):
                return {"success": False, "message": "Account inactive"}
            
            # Create token
            token = self.create_token({
                "sub": user_data['emailId'],
                "userId": user_data['userId'],
                "userType": user_data['userType'],
                "companyCode": user_data['companyCode']
            })
            
            # Return response
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
