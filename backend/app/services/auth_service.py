"""
Authentication Service - Firebase Auth integration
"""
import logging
from typing import Optional, Dict, Any
from datetime import datetime
from firebase_admin import auth
from google.cloud.firestore_v1.base_query import FieldFilter

from app.services.firebase_service import firebase_service
from app.models.user import UserRegistration, UserLogin, UserMaster, UserResponse

logger = logging.getLogger(__name__)


class AuthService:
    """Service for user authentication and management"""
    
    def __init__(self):
        self.db = firebase_service.db
        if not self.db:
            logger.warning("⚠️  Firebase not connected - Auth service will not work")

    
    def _generate_user_id(self, company_code: int) -> str:
        """Generate next sequential user ID for a company"""
        try:
            # Check if Firebase is connected
            if not self.db:
                logger.warning("Firebase not connected, using default user ID")
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
        Register a new user with Firebase Auth and Firestore
        
        Flow:
        1. Create user in Firebase Auth
        2. Generate userId
        3. Save user profile in user_master collection
        4. Map Firebase UID with userId
        """
        try:
            # Check Firebase connection
            if not self.db:
                return {
                    "success": False,
                    "message": "Firebase not connected. Please check server configuration."
                }
            # Step 1: Create user in Firebase Auth
            firebase_user = auth.create_user(
                email=registration.username,
                password=registration.password,
                email_verified=False
            )
            
            logger.info(f"Created Firebase user: {firebase_user.uid}")
            
            # Step 2: Generate userId
            user_id = self._generate_user_id(registration.companyCode)
            composite_id = f"{registration.companyCode}-{user_id}"
            
            # Step 3: Create user_master record
            user_data = UserMaster(
                **{"_id": composite_id},  # Use alias
                userId=user_id,
                userStatus="Permanent",
                userType=registration.userType,
                mobileNo=registration.mobileNo,
                emailId=registration.username,
                isActive=True,
                entryDate=datetime.utcnow(),
                companyCode=registration.companyCode,
                firebaseUid=firebase_user.uid
            )
            
            # Save to Firestore
            self.db.collection('user_master').document(composite_id).set(
                user_data.model_dump(mode='json', by_alias=True)
            )
            
            logger.info(f"Created user_master record: {composite_id}")
            
            return {
                "success": True,
                "message": "User registered successfully",
                "userId": user_id,
                "email": registration.username
            }
            
        except auth.EmailAlreadyExistsError:
            logger.warning(f"Email already exists: {registration.username}")
            return {
                "success": False,
                "message": "Email already registered"
            }
        except Exception as e:
            logger.error(f"Registration error: {str(e)}", exc_info=True)
            # Cleanup: try to delete Firebase user if created
            try:
                if 'firebase_user' in locals():
                    auth.delete_user(firebase_user.uid)
            except:
                pass
            
            return {
                "success": False,
                "message": f"Registration failed: {str(e)}"
            }
    
    async def login_user(self, login: UserLogin) -> Dict[str, Any]:
        """
        Login user with Firebase Auth
        
        Flow:
        1. Verify credentials with Firebase Auth (via custom token)
        2. Fetch user record from user_master
        3. Check if isActive = true
        4. Return user data with role
        """
        try:
            # Check Firebase connection
            if not self.db:
                return {
                    "success": False,
                    "message": "Firebase not connected. Please check server configuration."
                }
            # Get user by email from Firebase Auth
            firebase_user = auth.get_user_by_email(login.username)
            
            # Fetch user record from Firestore
            users_ref = self.db.collection('user_master')
            query = users_ref.where(filter=FieldFilter('firebaseUid', '==', firebase_user.uid))
            docs = list(query.stream())
            
            if not docs:
                return {
                    "success": False,
                    "message": "User not found in database"
                }
            
            user_doc = docs[0]
            user_data = user_doc.to_dict()
            
            # Check if user is active
            if not user_data.get('isActive', False):
                return {
                    "success": False,
                    "message": "User account is deactivated"
                }
            
            # Generate custom token for the user
            custom_token = auth.create_custom_token(
                firebase_user.uid,
                {
                    'userType': user_data.get('userType'),
                    'userId': user_data.get('userId'),
                    'companyCode': user_data.get('companyCode')
                }
            )
            
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
                "token": custom_token.decode('utf-8') if isinstance(custom_token, bytes) else custom_token,
                "firebaseUid": firebase_user.uid
            }
            
        except auth.UserNotFoundError:
            return {
                "success": False,
                "message": "Invalid credentials"
            }
        except Exception as e:
            logger.error(f"Login error: {str(e)}", exc_info=True)
            return {
                "success": False,
                "message": f"Login failed: {str(e)}"
            }
    
    async def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify Firebase ID token"""
        try:
            decoded_token = auth.verify_id_token(token)
            return decoded_token
        except Exception as e:
            logger.error(f"Token verification error: {str(e)}")
            return None
    
    async def get_user_by_uid(self, firebase_uid: str) -> Optional[Dict[str, Any]]:
        """Get user data from Firestore by Firebase UID"""
        try:
            # Check Firebase connection
            if not self.db:
                logger.error("Firebase not connected")
                return None
            users_ref = self.db.collection('user_master')
            query = users_ref.where(filter=FieldFilter('firebaseUid', '==', firebase_uid))
            docs = list(query.stream())
            
            if docs:
                return docs[0].to_dict()
            return None
        except Exception as e:
            logger.error(f"Error fetching user: {str(e)}")
            return None


# Singleton instance
auth_service = AuthService()
