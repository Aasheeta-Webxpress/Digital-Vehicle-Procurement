"""
Bid Service - Business logic for bid operations with transaction support
"""
from typing import List, Optional
from datetime import datetime
from firebase_admin import firestore
import logging

from app.services.firebase_service import firebase_service
from app.models import Bid, BidCreate, BidStatus

logger = logging.getLogger(__name__)


class BidService:
    """Service for bid operations"""
    
    @staticmethod
    async def get_all_bids(
        indent_id: Optional[str] = None,
        vendor_id: Optional[str] = None,
        limit: int = 100
    ) -> List[dict]:
        """
        Fetch all bids with optional filters
        
        Args:
            indent_id: Filter by indent ID
            vendor_id: Filter by vendor ID
            limit: Maximum number of results
            
        Returns:
            List of bid dictionaries
        """
        try:
            collection = firebase_service.bids_collection
            if not collection:
                logger.warning("Firebase not connected, returning empty list")
                return []
            
            # Simplified query for Datastore Mode
            # Get all documents and filter/sort in memory
            docs = collection.limit(limit).stream()
            
            bids = []
            for doc in docs:
                bid_data = doc.to_dict()
                bid_data['id'] = doc.id
                
                # Apply filters in memory
                if indent_id and bid_data.get('indentId') != indent_id:
                    continue
                
                if vendor_id and bid_data.get('vendorId') != vendor_id:
                    continue
                
                bids.append(bid_data)
            
            # Sort by timestamp (descending) in memory
            bids.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
            
            logger.info(f"Retrieved {len(bids)} bids")
            return bids
            
        except Exception as e:
            logger.error(f"Error fetching bids: {str(e)}")
            raise
    
    @staticmethod
    async def get_bids_for_indent(indent_id: str) -> List[dict]:
        """
        Fetch all bids for a specific indent, sorted by amount
        
        Args:
            indent_id: Indent ID
            
        Returns:
            List of bid dictionaries sorted by amount (ascending)
        """
        try:
            collection = firebase_service.bids_collection
            if not collection:
                return []
            
            # Query bids for this indent
            query = collection.where('indentId', '==', indent_id)
            docs = query.stream()
            
            bids = []
            for doc in docs:
                bid_data = doc.to_dict()
                bid_data['id'] = doc.id
                bids.append(bid_data)
            
            # Sort by amount (ascending) to get L1, L2, L3...
            bids.sort(key=lambda x: x['amount'])
            
            # Assign ranks
            for idx, bid in enumerate(bids, start=1):
                bid['rank'] = idx
            
            logger.info(f"Retrieved {len(bids)} bids for indent {indent_id}")
            return bids
            
        except Exception as e:
            logger.error(f"Error fetching bids for indent {indent_id}: {str(e)}")
            raise
    
    @staticmethod
    async def submit_bid(bid_data: BidCreate) -> dict:
        """
        Submit a new bid and update indent (without transactions for Datastore Mode compatibility)
        
        Args:
            bid_data: Bid creation data
            
        Returns:
            Created bid dictionary with update status
        """
        try:
            if not firebase_service.bids_collection or not firebase_service.indents_collection:
                raise Exception("Firebase not connected")
            
            # Generate bid ID
            bid_id = f"B{int(datetime.now().timestamp() * 1000)}"
            
            # Prepare bid document
            bid_dict = bid_data.dict()
            bid_dict['id'] = bid_id
            bid_dict['timestamp'] = datetime.now().isoformat()
            bid_dict['createdAt'] = datetime.now().isoformat()
            
            # References
            indent_ref = firebase_service.indents_collection.document(bid_data.indentId)
            bid_ref = firebase_service.bids_collection.document(bid_id)
            
            # Get current indent (without transaction)
            indent_snapshot = indent_ref.get()
            
            if not indent_snapshot.exists:
                raise Exception(f"Indent {bid_data.indentId} not found")
            
            indent = indent_snapshot.to_dict()
            
            # Check if new bid is lower than current lowest
            current_lowest = indent.get('lowestBid', float('inf'))
            is_new_lowest = bid_data.amount < current_lowest
            
            # --- MINIMUM DECREMENT RULE ---
            # If there is already a lowest bid, the new bid must be at least 200 lower
            if current_lowest != float('inf'):
                if bid_data.amount >= current_lowest:
                     raise ValueError(f"Bid amount {bid_data.amount} must be lower than current lowest bid {current_lowest}")
                
                if bid_data.amount > (current_lowest - 200):
                     raise ValueError(f"Bid does not meet minimum decrement rule. Must be at least 200 lower than {current_lowest}")
            # ------------------------------
            
            # Prepare indent updates
            indent_updates = {
                'bidCount': indent.get('bidCount', 0) + 1,
                'updatedAt': datetime.now().isoformat()
            }
            
            if is_new_lowest:
                indent_updates['lowestBid'] = bid_data.amount
                indent_updates['lowestBidVendorName'] = bid_data.vendorName
                indent_updates['status'] = BidStatus.IN_PROGRESS.value
            
            # Create bid first
            bid_ref.set(bid_dict)
            logger.info(f"Created bid {bid_id}")
            
            # Then update indent
            indent_ref.update(indent_updates)
            logger.info(f"Updated indent {bid_data.indentId}")
            
            result = {
                'bid': bid_dict,
                'isNewLowest': is_new_lowest,
                'indentUpdates': indent_updates
            }
            
            logger.info(f"Submitted bid {bid_id} for indent {bid_data.indentId}")
            return result
            
        except Exception as e:
            logger.error(f"Error submitting bid: {str(e)}")
            raise


bid_service = BidService()
