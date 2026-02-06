"""
Firebase Service - Singleton service for Firebase Firestore operations
specifying the Named Database 'digitalvehicleprocurement6226'
"""
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud import firestore as google_firestore
from typing import Optional
import logging
import os
from app.config import settings

logger = logging.getLogger(__name__)


class FirebaseService:
    """Singleton service for Firebase Firestore operations"""
    
    _instance: Optional['FirebaseService'] = None
    _db: Optional[google_firestore.Client] = None
    _initialized: bool = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self._initialize_firebase()
            self._initialized = True
    
    def _initialize_firebase(self):
        """Initialize Firebase implementation pointing to named database"""
        try:
            # Check if credentials file exists
            cred_path = settings.firebase_credentials_path
            if not os.path.exists(cred_path):
                logger.warning(f"Firebase credentials not found at {cred_path}")
                self._db = None
                return

            # Load credentials
            cred = credentials.Certificate(cred_path)
            
            # Initialize App (if not already)
            if not firebase_admin._apps:
                firebase_admin.initialize_app(cred, {
                    'projectId': settings.firebase_project_id,
                })
                logger.info("Firebase Admin App initialized")
            
            # CRITICAL: Manually create Client with the specific database name
            # This allows us to connect to 'digitalvehicleprocurement6226'
            self._db = google_firestore.Client(
                project=settings.firebase_project_id,
                credentials=cred.get_credential(),
                database="digitalvehicleprocurement6226"
            )
            
            logger.info("✅ Successfully connected to Firestore DB: 'digitalvehicleprocurement6226'")
            
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {str(e)}")
            self._db = None
    
    @property
    def db(self) -> Optional[google_firestore.Client]:
        """Get Firestore client instance"""
        return self._db
    
    @property
    def is_connected(self) -> bool:
        """Check if Firebase is connected"""
        return self._db is not None
    
    # Collection references
    @property
    def indents_collection(self):
        if self._db: return self._db.collection('indents')
        return None
    
    @property
    def bids_collection(self):
        if self._db: return self._db.collection('bids')
        return None
    
    @property
    def vendors_collection(self):
        if self._db: return self._db.collection('vendors')
        return None
    
    @property
    def lanes_collection(self):
        if self._db: return self._db.collection('lanes')
        return None
    
    @property
    def api_keys_collection(self):
        if self._db: return self._db.collection('api_keys')
        return None
    
    @property
    def user_master_collection(self):
        if self._db: return self._db.collection('user_master')
        return None


# Singleton instance
firebase_service = FirebaseService()
