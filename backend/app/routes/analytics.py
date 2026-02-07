"""
Analytics API Routes
"""
from fastapi import APIRouter, HTTPException
import logging

from app.services.analytics_service import analytics_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])


@router.get("/trends")
async def get_procurement_trends():
    """
    Get procurement trends and metrics
    
    Returns:
    - **avg_reduction**: Average price reduction percentage
    - **total_savings**: Total savings achieved (INR)
    - **volume**: Total number of indents
    """
    try:
        trends = await analytics_service.get_procurement_trends()
        return trends
    except Exception as e:
        logger.error(f"Error fetching trends: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/dashboard")
async def get_dashboard_metrics():
    """
    Get dashboard metrics
    
    Returns comprehensive dashboard data including:
    - Total indents count
    - Active indents count
    - Closed indents count
    - Awarded indents count
    - Total bids count
    - Average reduction percentage
    - Total savings (INR)
    """
    try:
        metrics = await analytics_service.get_dashboard_metrics()
        return metrics
    except Exception as e:
        logger.error(f"Error fetching dashboard metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
