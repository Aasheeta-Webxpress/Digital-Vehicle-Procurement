"""
Authentication Service - Custom JWT Implementation
Replaces Firebase Auth with direct DB credential management
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

# Password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    """Service for user authentication and management (Custom JWT)"""
    
    def __init__(self):
        self.db = firebase_service.db
        if not self.db:
            logger.warning("⚠️  Firebase not connected - Auth service will not work")

    @staticmethod
    def verify_password(plain_password, hashed_password):
        """Verify plain password against hash"""
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def get_password_hash(password):
        """Generate password hash"""
        return pwd_context.hash(password)

    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
        return encoded_jwt

    def _generate_user_id(self, company_code: int) -> str:
        """Generate next sequential user ID for a company (USRxxxx)"""
        try:
            if not self.db:
                return "USR0001"
            
            # Query existing users for this company
            users_ref = self.db.collection('user_master')
            query = users_ref.where(filter=FieldFilter('companyCode', '==', company_code))
            docs = query.stream()
            
            # Find highest user number
            max_num = 0
            for doc in docs:
                user_id = doc.get('userId')
                if user_id and user_id.startswith('USR'):
                    try:
                        num = int(user_id[3:])
                        max_num = max(max_num, num)
                    except ValueError:
                        continue
            
            # Generate next ID
            next_num = max_num + 1
            return f"USR{next_num:04d}"
            
        except Exception as e:
            logger.error(f"Error generating user ID: {str(e)}")
            return "USR0001"
    
    async def register_user(self, registration: UserRegistration) -> Dict[str, Any]:
        """
        Register a new user (Custom Auth Flow)
        
        1. Check if email already exists
        2. Generate userId and composite _id
        3. Hash password
        4. Save to user_master
        """
        try:
            if not self.db:
                return {"success": False, "message": "Database not connected"}
            
            # Step 1: Check if email exists
            users_ref = self.db.collection('user_master')
            query = users_ref.where(filter=FieldFilter('emailId', '==', registration.username))
            existing_docs = list(query.stream())
            
            if existing_docs:
                return {"success": False, "message": "Email already registered"}
            
            # Step 2: Generate IDs
            user_id = self._generate_user_id(registration.companyCode)
            composite_id = f"{registration.companyCode}-{user_id}"
            
            # Step 3: Hash password
            hashed_password = self.get_password_hash(registration.password)
            
            # Step 4: Create user_master record
            # Note: We use firebaseUid field to store legacy or self-reference if needed, 
            # but for custom auth it's less critical. We'll store the userId there or a placeholder.
            user_data = UserMaster(
                **{"_id": composite_id},
                userId=user_id,
                userpassword=hashed_password,
                userStatus="Permanent",
                userType=registration.userType,
                mobileNo=registration.mobileNo,
                emailId=registration.username,
                isActive=True,
                entryDate=datetime.utcnow(),
                companyCode=registration.companyCode,
                firebaseUid=composite_id # Use composite ID as placeholder for UID
            )
            
            # Save to Firestore
            self.db.collection('user_master').document(composite_id).set(
                user_data.model_dump(mode='json', by_alias=True)
            )
            
            logger.info(f"Registered user: {composite_id}")
            
            return {
                "success": True,
                "message": "User registered successfully",
                "userId": user_id,
                "email": registration.username
            }
            
        except Exception as e:
            logger.error(f"Registration error: {str(e)}", exc_info=True)
            return {"success": False, "message": f"Registration failed: {str(e)}"}
    
    async def login_user(self, login: UserLogin) -> Dict[str, Any]:
        """
        Login user (Custom Auth Flow)
        
        1. Find user by email
        2. Verify password hash
        3. Check isActive
        4. Generate JWT
        """
        try:
            if not self.db:
                return {"success": False, "message": "Database not connected"}
            
            # Step 1: Find user
            users_ref = self.db.collection('user_master')
            query = users_ref.where(filter=FieldFilter('emailId', '==', login.username))
            docs = list(query.stream())
            
            if not docs:
                return {"success": False, "message": "Invalid credentials"}
            
            user_doc = docs[0]
            user_data = user_doc.to_dict()
            
            # Step 2: Verify password
            stored_password = user_data.get('userpassword')
            if not stored_password or not self.verify_password(login.password, stored_password):
                return {"success": False, "message": "Invalid credentials"}
            
            # Step 3: Check status
            if not user_data.get('isActive', False):
                return {"success": False, "message": "User account is deactivated"}
            
            # Step 4: Generate JWT
            token_data = {
                "sub": user_data.get('emailId'),  # Subject
                "userId": user_data.get('userId'),
                "userType": user_data.get('userType'),
                "companyCode": user_data.get('companyCode')
            }
            token = self.create_access_token(token_data)
            
            # Prepare user response
            user_response = UserResponse(
                userId=user_data.get('userId'),
                userType=user_data.get('userType'),
                mobileNo=user_data.get('mobileNo'),
                emailId=user_data.get('emailId'),
                isActive=user_data.get('isActive'),
                companyCode=user_data.get('companyCode'),
                userStatus=user_data.get('userStatus'),
                entryDate=user_data.get('entryDate')
            )
            
            return {
                "success": True,
                "message": "Login successful",
                "user": user_response.model_dump(),
                "token": token
            }
            
        except Exception as e:
            logger.error(f"Login error: {str(e)}", exc_info=True)
            return {"success": False, "message": f"Login failed: {str(e)}"}
    
    async def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify Custom JWT token"""
        try:
            payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            logger.warning("Token expired")
            return None
        except jwt.InvalidTokenError:
            logger.warning("Invalid token")
            return None
        except Exception as e:
            logger.error(f"Token verification error: {str(e)}")
            return None
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user data by email"""
        try:
            if not self.db: return None
            users_ref = self.db.collection('user_master')
            query = users_ref.where(filter=FieldFilter('emailId', '==', email))
            docs = list(query.stream())
            if docs:
                return docs[0].to_dict()
            return None
        except Exception as e:
            logger.error(f"Error fetching user: {str(e)}")
            return None

# Singleton instance
auth_service = AuthService()
