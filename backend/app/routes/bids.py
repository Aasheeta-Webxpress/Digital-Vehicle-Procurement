"""
Bid API Routes
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
import logging

from app.models import Bid, BidCreate
from app.services.bid_service import bid_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/bids", tags=["bids"])


@router.get("/", response_model=List[dict])
async def get_bids(
    indent_id: Optional[str] = Query(None, description="Filter by indent ID"),
    vendor_id: Optional[str] = Query(None, description="Filter by vendor ID"),
    limit: int = Query(100, le=1000, description="Maximum number of results")
):
    """
    Fetch all bids with optional filters
    
    - **indent_id**: Filter by indent ID
    - **vendor_id**: Filter by vendor ID
    - **limit**: Maximum number of results (default: 100, max: 1000)
    """
    try:
        bids = await bid_service.get_all_bids(
            indent_id=indent_id,
            vendor_id=vendor_id,
            limit=limit
        )
        return bids
    except Exception as e:
        logger.error(f"Error fetching bids: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=dict, status_code=201)
async def submit_bid(bid: BidCreate):
    """
    Submit a new bid
    
    This endpoint uses a transaction to:
    1. Create the bid document
    2. Update the indent's lowest bid if applicable
    3. Increment the indent's bid count
    
    - **bid**: Bid creation data
    """
    try:
        result = await bid_service.submit_bid(bid)
        return {
            "status": "success",
            "bid": result['bid'],
            "isNewLowest": result['isNewLowest'],
            "message": "Bid submitted successfully"
        }
    except Exception as e:
        logger.error(f"Error submitting bid: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/indent/{indent_id}", response_model=List[dict])
async def get_bids_for_indent(indent_id: str):
    """
    Fetch all bids for a specific indent, sorted by amount
    
    Bids are returned in ascending order by amount (L1, L2, L3...)
    Each bid includes a rank field.
    
    - **indent_id**: Unique indent identifier
    """
    try:
        bids = await bid_service.get_bids_for_indent(indent_id)
        return bids
    except Exception as e:
        logger.error(f"Error fetching bids for indent {indent_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
