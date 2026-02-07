"""
Vendor Service - Business logic for vendor management, ratings, and reviews
"""
from typing import List, Optional
from datetime import datetime
from firebase_admin import firestore
import logging

from app.services.firebase_service import firebase_service
from app.models import Vendor, VendorCreate, VendorReview

logger = logging.getLogger(__name__)


class VendorService:
    """Service for vendor operations"""
    
    @staticmethod
    async def get_vendor_by_id(vendor_id: str) -> Optional[dict]:
        """
        Fetch a single vendor by ID
        
        Args:
            vendor_id: Vendor ID
            
        Returns:
            Vendor dictionary or None
        """
        try:
            collection = firebase_service.db.collection('vendors')
            doc = collection.document(vendor_id).get()
            
            if doc.exists:
                vendor_data = doc.to_dict()
                vendor_data['id'] = doc.id
                return vendor_data
            
            return None
            
        except Exception as e:
            logger.error(f"Error fetching vendor {vendor_id}: {str(e)}")
            raise
    
    @staticmethod
    async def submit_review(review_data: dict) -> dict:
        """
        Submit post-delivery review for vendor
        
        Args:
            review_data: Review data including rating, onTime, behavior, remarks
            
        Returns:
            Created review dictionary
        """
        try:
            db = firebase_service.db
            
            # Generate review ID
            review_id = f"REV{int(datetime.now().timestamp() * 1000)}"
            
            # Prepare review document
            review = {
                'id': review_id,
                'indentId': review_data['indentId'],
                'vendorId': review_data['vendorId'],
                'customerId': review_data['customerId'],
                'rating': review_data['rating'],  # 1-5
                'onTime': review_data['onTime'],
                'behavior': review_data['behavior'],  # Good, Average, Poor
                'remarks': review_data.get('remarks', ''),
                'createdAt': datetime.now().isoformat()
            }
            
            # Save review
            db.collection('reviews').document(review_id).set(review)
            logger.info(f"Created review {review_id} for vendor {review_data['vendorId']}")
            
            # Update vendor aggregate rating
            await VendorService.update_vendor_rating(review_data['vendorId'])
            
            return review
            
        except Exception as e:
            logger.error(f"Error submitting review: {str(e)}")
            raise
    
    @staticmethod
    async def update_vendor_rating(vendor_id: str):
        """
        Recalculate vendor average rating and on-time percentage
        
        Args:
            vendor_id: Vendor ID
        """
        try:
            db = firebase_service.db
            
            # Fetch all reviews for this vendor
            reviews_query = db.collection('reviews').where('vendorId', '==', vendor_id)
            reviews = list(reviews_query.stream())
            
            if not reviews:
                logger.info(f"No reviews found for vendor {vendor_id}")
                return
            
            # Calculate average rating
            ratings = [r.to_dict()['rating'] for r in reviews]
            avg_rating = sum(ratings) / len(ratings)
            
            # Calculate on-time percentage
            on_time_count = sum(1 for r in reviews if r.to_dict()['onTime'])
            on_time_percent = (on_time_count / len(reviews)) * 100
            
            # Update vendor document
            vendor_ref = db.collection('vendors').document(vendor_id)
            vendor_ref.update({
                'rating': round(avg_rating, 2),
                'onTimePercent': round(on_time_percent, 2),
                'totalReviews': len(reviews),
                'updatedAt': datetime.now().isoformat()
            })
            
            logger.info(f"Updated vendor {vendor_id} rating to {avg_rating:.2f} ({len(reviews)} reviews)")
            
        except Exception as e:
            logger.error(f"Error updating vendor rating: {str(e)}")
            raise
    
    @staticmethod
    async def blacklist_vendor(vendor_id: str, reason: str) -> dict:
        """
        Blacklist a vendor
        
        Args:
            vendor_id: Vendor ID
            reason: Reason for blacklisting
            
        Returns:
            Updated vendor dictionary
        """
        try:
            db = firebase_service.db
            vendor_ref = db.collection('vendors').document(vendor_id)
            
            vendor_ref.update({
                'isBlacklisted': True,
                'blacklistReason': reason,
                'updatedAt': datetime.now().isoformat()
            })
            
            logger.info(f"Blacklisted vendor {vendor_id}: {reason}")
            
            # Fetch and return updated vendor
            updated_doc = vendor_ref.get()
            result = updated_doc.to_dict()
            result['id'] = updated_doc.id
            
            return result
            
        except Exception as e:
            logger.error(f"Error blacklisting vendor {vendor_id}: {str(e)}")
            raise
    
    @staticmethod
    async def get_vendor_reviews(vendor_id: str, limit: int = 50) -> List[dict]:
        """
        Get all reviews for a vendor
        
        Args:
            vendor_id: Vendor ID
            limit: Maximum number of reviews to return
            
        Returns:
            List of review dictionaries
        """
        try:
            db = firebase_service.db
            
            reviews_query = db.collection('reviews')\
                .where('vendorId', '==', vendor_id)\
                .limit(limit)
            
            reviews = []
            for doc in reviews_query.stream():
                review_data = doc.to_dict()
                review_data['id'] = doc.id
                reviews.append(review_data)
            
            # Sort by creation date (descending)
            reviews.sort(key=lambda x: x.get('createdAt', ''), reverse=True)
            
            logger.info(f"Retrieved {len(reviews)} reviews for vendor {vendor_id}")
            return reviews
            
        except Exception as e:
            logger.error(f"Error fetching vendor reviews: {str(e)}")
            raise


vendor_service = VendorService()
