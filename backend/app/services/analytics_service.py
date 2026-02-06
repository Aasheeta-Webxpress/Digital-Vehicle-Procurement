"""
Analytics Service - Business logic for analytics and reporting
"""
from typing import List, Dict
from datetime import datetime
import logging

from app.services.firebase_service import firebase_service
from app.models import BidStatus

logger = logging.getLogger(__name__)


class AnalyticsService:
    """Service for analytics operations"""
    
    @staticmethod
    async def get_procurement_trends() -> Dict:
        """
        Calculate procurement trends and metrics
        
        Returns:
            Dictionary with analytics data
        """
        try:
            collection = firebase_service.indents_collection
            if not collection:
                return {
                    "avg_reduction": 0.0,
                    "total_savings": 0.0,
                    "volume": 0
                }
            
            # Fetch all indents
            docs = collection.stream()
            
            total_estimated = 0.0
            total_savings = 0.0
            count = 0
            
            for doc in docs:
                indent = doc.to_dict()
                estimated_price = indent.get('estimatedPrice', 0)
                lowest_bid = indent.get('lowestBid')
                
                if lowest_bid:
                    savings = estimated_price - lowest_bid
                    total_savings += savings
                    total_estimated += estimated_price
                
                count += 1
            
            # Calculate average reduction percentage
            avg_reduction = (total_savings / total_estimated * 100) if total_estimated > 0 else 0.0
            
            result = {
                "avg_reduction": round(avg_reduction, 2),
                "total_savings": round(total_savings, 2),
                "volume": count
            }
            
            logger.info(f"Calculated procurement trends: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Error calculating trends: {str(e)}")
            raise
    
    @staticmethod
    async def get_dashboard_metrics() -> Dict:
        """
        Calculate dashboard metrics
        
        Returns:
            Dictionary with dashboard data
        """
        try:
            indents_collection = firebase_service.indents_collection
            bids_collection = firebase_service.bids_collection
            
            if not indents_collection or not bids_collection:
                return {
                    "totalIndents": 0,
                    "activeIndents": 0,
                    "closedIndents": 0,
                    "awardedIndents": 0,
                    "totalBids": 0,
                    "avgReduction": 0.0,
                    "totalSavings": 0.0
                }
            
            # Fetch all indents
            indent_docs = indents_collection.stream()
            
            total_indents = 0
            active_indents = 0
            closed_indents = 0
            awarded_indents = 0
            total_estimated = 0.0
            total_savings = 0.0
            
            for doc in indent_docs:
                indent = doc.to_dict()
                status = indent.get('status')
                
                total_indents += 1
                
                if status in [BidStatus.BID_INVITED.value, BidStatus.IN_PROGRESS.value, BidStatus.RE_BID.value]:
                    active_indents += 1
                elif status == BidStatus.BID_CLOSED.value:
                    closed_indents += 1
                elif status == BidStatus.BID_AWARDED.value:
                    awarded_indents += 1
                
                estimated_price = indent.get('estimatedPrice', 0)
                lowest_bid = indent.get('lowestBid')
                
                if lowest_bid:
                    savings = estimated_price - lowest_bid
                    total_savings += savings
                    total_estimated += estimated_price
            
            # Count total bids
            bid_docs = bids_collection.stream()
            total_bids = sum(1 for _ in bid_docs)
            
            # Calculate average reduction
            avg_reduction = (total_savings / total_estimated * 100) if total_estimated > 0 else 0.0
            
            result = {
                "totalIndents": total_indents,
                "activeIndents": active_indents,
                "closedIndents": closed_indents,
                "awardedIndents": awarded_indents,
                "totalBids": total_bids,
                "avgReduction": round(avg_reduction, 2),
                "totalSavings": round(total_savings, 2)
            }
            
            logger.info(f"Calculated dashboard metrics: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Error calculating dashboard metrics: {str(e)}")
            raise


analytics_service = AnalyticsService()
