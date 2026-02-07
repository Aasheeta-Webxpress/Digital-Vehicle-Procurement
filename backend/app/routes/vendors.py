"""
Vendor Routes - API endpoints for vendor management, ratings, and reviews
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
import logging

from app.services.vendor_service import vendor_service
from app.middleware.auth import get_current_user, require_role

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/vendors", tags=["Vendors"])


@router.get("/{vendor_id}", response_model=dict)
async def get_vendor(
    vendor_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get vendor details by ID"""
    try:
        vendor = await vendor_service.get_vendor_by_id(vendor_id)
        if not vendor:
            raise HTTPException(status_code=404, detail=f"Vendor {vendor_id} not found")
        return vendor
    except Exception as e:
        logger.error(f"Error fetching vendor: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reviews", response_model=dict, status_code=201)
async def submit_review(
    review_data: dict,
    current_user: dict = Depends(require_role("Customer"))
):
    """
    Submit post-delivery review for vendor (Customer only)
    
    Request body:
    {
        "indentId": "TR123",
        "vendorId": "V-101",
        "rating": 4.5,
        "onTime": true,
        "behavior": "Good",
        "remarks": "Excellent service"
    }
    """
    try:
        # Add customer ID from authenticated user
        review_data['customerId'] = current_user['userId']
        
        review = await vendor_service.submit_review(review_data)
        return review
    except Exception as e:
        logger.error(f"Error submitting review: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{vendor_id}/reviews", response_model=List[dict])
async def get_vendor_reviews(
    vendor_id: str,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """Get all reviews for a vendor"""
    try:
        reviews = await vendor_service.get_vendor_reviews(vendor_id, limit)
        return reviews
    except Exception as e:
        logger.error(f"Error fetching vendor reviews: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{vendor_id}/blacklist", response_model=dict)
async def blacklist_vendor(
    vendor_id: str,
    blacklist_data: dict,
    current_user: dict = Depends(require_role("Customer"))
):
    """
    Blacklist a vendor (Customer only)
    
    Request body:
    {
        "reason": "Multiple delivery failures"
    }
    """
    try:
        reason = blacklist_data.get('reason', 'Policy violation')
        vendor = await vendor_service.blacklist_vendor(vendor_id, reason)
        return vendor
    except Exception as e:
        logger.error(f"Error blacklisting vendor: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
