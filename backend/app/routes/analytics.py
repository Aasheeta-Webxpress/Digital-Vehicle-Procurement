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


@router.get("/savings")
async def get_savings_report(start_date: str = None, end_date: str = None):
    """
    Get comprehensive savings report
    
    Query Parameters:
    - **start_date**: Optional start date filter (ISO format)
    - **end_date**: Optional end date filter (ISO format)
    
    Returns:
    - **totalExpected**: Total expected price
    - **totalActual**: Total actual price (awarded bids)
    - **totalSavings**: Total savings achieved
    - **savingsPercent**: Savings percentage
    - **topVendors**: Top 5 vendors by savings contribution
    """
    try:
        report = await analytics_service.get_savings_report(start_date, end_date)
        return report
    except Exception as e:
        logger.error(f"Error generating savings report: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
