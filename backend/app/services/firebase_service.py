"""
Firebase Service - Singleton service for Firebase Firestore operations
Provides centralized access to Firestore collections
"""
import firebase_admin
from firebase_admin import credentials, firestore
from typing import Optional
import logging
from app.config import settings

logger = logging.getLogger(__name__)


class FirebaseService:
    """Singleton service for Firebase Firestore operations"""
    
    _instance: Optional['FirebaseService'] = None
    _db: Optional[firestore.Client] = None
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
        """Initialize Firebase Admin SDK"""
        try:
            # Check if Firebase app already exists
            if not firebase_admin._apps:
                cred_path = settings.firebase_credentials_path
                
                # Check if credentials file exists
                import os
                if not os.path.exists(cred_path):
                    logger.warning(
                        f"Firebase credentials not found at {cred_path}. "
                        "Using mock mode for development."
                    )
                    # In development, you can work without Firebase initially
                    self._db = None
                    return
                
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred, {
                    'projectId': settings.firebase_project_id,
                })
                logger.info("Firebase Admin SDK initialized successfully")
            
            self._db = firestore.client()
            logger.info("Firestore client created successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {str(e)}")
            self._db = None
    
    @property
    def db(self) -> Optional[firestore.Client]:
        """Get Firestore client instance"""
        if self._db is None:
            logger.warning("Firestore client not initialized. Check Firebase credentials.")
        return self._db
    
    @property
    def is_connected(self) -> bool:
        """Check if Firebase is connected"""
        return self._db is not None
    
    # Collection references
    @property
    def indents_collection(self):
        """Get indents collection reference"""
        if self._db:
            return self._db.collection('indents')
        return None
    
    @property
    def bids_collection(self):
        """Get bids collection reference"""
        if self._db:
            return self._db.collection('bids')
        return None
    
    @property
    def vendors_collection(self):
        """Get vendors collection reference"""
        if self._db:
            return self._db.collection('vendors')
        return None
    
    @property
    def lanes_collection(self):
        """Get lanes collection reference"""
        if self._db:
            return self._db.collection('lanes')
        return None
    
    @property
    def api_keys_collection(self):
        """Get API keys collection reference"""
        if self._db:
            return self._db.collection('api_keys')
        return None


# Singleton instance
firebase_service = FirebaseService()
