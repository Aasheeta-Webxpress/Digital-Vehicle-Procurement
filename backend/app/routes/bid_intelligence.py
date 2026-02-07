"""
Bid Intelligence Routes - API endpoints for smart bid suggestions
"""
from fastapi import APIRouter, HTTPException, Depends
import logging

from app.services.bid_intelligence_service import bid_intelligence_service
from app.middleware.auth import get_current_user, require_role

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/bid-intelligence", tags=["Bid Intelligence"])


@router.get("/suggestions/{indent_id}", response_model=dict)
async def get_bid_suggestions(
    indent_id: str,
    current_user: dict = Depends(require_role("Vendor"))
):
    """
    Get AI-powered bid suggestions for an indent (Vendor only)
    
    Returns three pricing strategies:
    - Conservative: Minimum required bid
    - Competitive: 5% lower than L1
    - Aggressive: 10% lower than L1
    
    Each with estimated win probability
    """
    try:
        vendor_id = current_user['userId']
        suggestions = await bid_intelligence_service.get_bid_suggestion(indent_id, vendor_id)
        return suggestions
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating bid suggestions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/confidence", response_model=dict)
async def calculate_bid_confidence(
    request_data: dict,
    current_user: dict = Depends(require_role("Vendor"))
):
    """
    Calculate confidence score for a specific bid amount
    
    Request body:
    {
        "indentId": "TR123",
        "suggestedBid": 24500
    }
    
    Returns:
    {
        "confidenceScore": 85,
        "factors": {...}
    }
    """
    try:
        from app.services.indent_service import indent_service
        
        vendor_id = current_user['userId']
        indent_id = request_data['indentId']
        suggested_bid = request_data['suggestedBid']
        
        # Get indent
        indent = await indent_service.get_indent_by_id(indent_id)
        if not indent:
            raise HTTPException(status_code=404, detail=f"Indent {indent_id} not found")
        
        # Calculate confidence
        confidence = await bid_intelligence_service.calculate_bid_confidence(
            vendor_id, indent, suggested_bid
        )
        
        return {
            'confidenceScore': confidence,
            'suggestedBid': suggested_bid,
            'indentId': indent_id
        }
    except Exception as e:
        logger.error(f"Error calculating bid confidence: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
