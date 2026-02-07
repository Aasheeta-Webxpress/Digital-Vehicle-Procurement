"""
Indent Service - Business logic for indent operations
"""
from typing import List, Optional
from datetime import datetime
from firebase_admin import firestore
import logging

from app.services.firebase_service import firebase_service
from app.models import Indent, IndentCreate, IndentUpdate, BidStatus

logger = logging.getLogger(__name__)


class IndentService:
    """Service for indent CRUD operations"""
    
    @staticmethod
    async def get_all_indents(
        status: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        limit: int = 100
    ) -> List[dict]:
        """
        Fetch all indents with optional filters (simplified for Datastore Mode)
        
        Args:
            status: Filter by status
            start_date: Filter by placement date (start)
            end_date: Filter by placement date (end)
            limit: Maximum number of results
            
        Returns:
            List of indent dictionaries
        """
        try:
            collection = firebase_service.indents_collection
            if not collection:
                logger.warning("Firebase not connected, returning empty list")
                return []
            
            # Simplified query for Datastore Mode compatibility
            # Get all documents and filter in memory
            docs = collection.limit(limit).stream()
            
            indents = []
            for doc in docs:
                indent_data = doc.to_dict()
                indent_data['id'] = doc.id
                
                # Apply filters in memory
                if status and indent_data.get('status') != status:
                    continue
                
                if start_date and indent_data.get('placementDate', '') < start_date:
                    continue
                
                if end_date and indent_data.get('placementDate', '') > end_date:
                    continue
                
                indents.append(indent_data)
            
            # Sort by placement date (descending) in memory
            indents.sort(key=lambda x: x.get('placementDate', ''), reverse=True)
            
            logger.info(f"Retrieved {len(indents)} indents")
            return indents
            
        except Exception as e:
            logger.error(f"Error fetching indents: {str(e)}")
            raise
    
    @staticmethod
    async def get_indent_by_id(indent_id: str) -> Optional[dict]:
        """
        Fetch a single indent by ID
        
        Args:
            indent_id: Indent ID
            
        Returns:
            Indent dictionary or None
        """
        try:
            collection = firebase_service.indents_collection
            if not collection:
                return None
            
            doc = collection.document(indent_id).get()
            
            if doc.exists:
                indent_data = doc.to_dict()
                indent_data['id'] = doc.id
                return indent_data
            
            return None
            
        except Exception as e:
            logger.error(f"Error fetching indent {indent_id}: {str(e)}")
            raise
    
    @staticmethod
    async def create_indent(indent_data: IndentCreate) -> dict:
        """
        Create a new indent
        
        Args:
            indent_data: Indent creation data
            
        Returns:
            Created indent dictionary
        """
        try:
            collection = firebase_service.indents_collection
            if not collection:
                raise Exception("Firebase not connected")
            
            # Generate ID
            indent_id = f"TR{datetime.now().strftime('%Y%m%d%H%M%S')}"
            
            # Prepare document data
            doc_data = indent_data.dict()
            doc_data['id'] = indent_id
            
            # Auto-Status Logic for Bidding Window
            now = datetime.now().isoformat()
            if indent_data.bidStartTime and indent_data.bidStartTime > now:
                doc_data['status'] = BidStatus.BID_INVITED.value # Or "SCHEDULED" if we had that status
            else:
                doc_data['status'] = BidStatus.BID_INVITED.value
                
            doc_data['bidCount'] = 0
            doc_data['createdAt'] = now
            doc_data['updatedAt'] = now
            
            # Save to Firestore
            collection.document(indent_id).set(doc_data)
            
            logger.info(f"Created indent: {indent_id}")
            return doc_data
            
        except Exception as e:
            logger.error(f"Error creating indent: {str(e)}")
            raise
    
    @staticmethod
    async def update_indent(indent_id: str, update_data: IndentUpdate) -> dict:
        """
        Update an existing indent
        
        Args:
            indent_id: Indent ID
            update_data: Update data
            
        Returns:
            Updated indent dictionary
        """
        try:
            collection = firebase_service.indents_collection
            if not collection:
                raise Exception("Firebase not connected")
            
            doc_ref = collection.document(indent_id)
            
            # Check if document exists
            if not doc_ref.get().exists:
                raise Exception(f"Indent {indent_id} not found")
            
            # Prepare update data (exclude None values)
            update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
            update_dict['updatedAt'] = datetime.now().isoformat()
            
            # Update document
            doc_ref.update(update_dict)
            
            # Fetch and return updated document
            updated_doc = doc_ref.get()
            result = updated_doc.to_dict()
            result['id'] = updated_doc.id
            
            logger.info(f"Updated indent: {indent_id}")
            return result
            
        except Exception as e:
            logger.error(f"Error updating indent {indent_id}: {str(e)}")
            raise
    
    @staticmethod
    async def delete_indent(indent_id: str) -> bool:
        """
        Delete an indent (soft delete - set isActive=False)
        
        Args:
            indent_id: Indent ID
            
        Returns:
            True if successful
        """
        try:
            collection = firebase_service.indents_collection
            if not collection:
                raise Exception("Firebase not connected")
            
            doc_ref = collection.document(indent_id)
            
            # Soft delete
            doc_ref.update({
                'isActive': False,
                'updatedAt': datetime.now().isoformat()
            })
            
            logger.info(f"Deleted indent: {indent_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting indent {indent_id}: {str(e)}")
            raise
    
    @staticmethod
    async def award_indent(indent_id: str, vendor_id: str, vendor_name: str) -> dict:
        """
        Award an indent to a vendor
        
        Args:
            indent_id: Indent ID
            vendor_id: Vendor ID
            vendor_name: Vendor name
            
        Returns:
            Updated indent dictionary
        """
        try:
            collection = firebase_service.indents_collection
            if not collection:
                raise Exception("Firebase not connected")
            
            doc_ref = collection.document(indent_id)
            
            # Update indent
            doc_ref.update({
                'status': BidStatus.BID_AWARDED.value,
                'winnerVendorId': vendor_id,
                'vendorName': vendor_name,
                'updatedAt': datetime.now().isoformat()
            })
            
            # --- UPDATE VENDOR STATS ---
            try:
                # Get vendor reference
                # Note: Assuming 'vendors' collection exists. If not, this part might need adjustment based on valid collection names.
                # Use firebase_service to get the collection ref if available, or db.collection directly
                db = firebase_service.db
                vendor_ref = db.collection('vendors').document(vendor_id)
                
                vendor_doc = vendor_ref.get()
                if vendor_doc.exists:
                    # Fetch indent amount to add to revenue
                    indent_doc = doc_ref.get()
                    indent_data = indent_doc.to_dict()
                    # Use lowestBid as the awarded amount, fallback to estimatedPrice if not set
                    amount = indent_data.get('lowestBid', indent_data.get('estimatedPrice', 0))
                    
                    # Update vendor stats atomically using increment
                    vendor_ref.update({
                        'totalAwards': firestore.Increment(1),
                        'totalRevenue': firestore.Increment(amount),
                        'updatedAt': datetime.now().isoformat()
                    })
                    logger.info(f"Updated stats for vendor {vendor_id}")
                else:
                    logger.warning(f"Vendor {vendor_id} not found in 'vendors' collection. Stats not updated.")
            except Exception as v_error:
                # Log error but don't fail the award process
                logger.error(f"Failed to update vendor stats: {str(v_error)}")
            # ---------------------------

            # Fetch and return updated document
            updated_doc = doc_ref.get()
            result = updated_doc.to_dict()
            result['id'] = updated_doc.id
            
            logger.info(f"Awarded indent {indent_id} to vendor {vendor_id}")
            return result
            
        except Exception as e:
            logger.error(f"Error awarding indent {indent_id}: {str(e)}")
            raise


indent_service = IndentService()
