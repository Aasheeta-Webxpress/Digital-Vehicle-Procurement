"""
Analytics Service - Business logic for analytics and reporting
"""
import logging
from typing import Dict, Any
from app.services.firebase_service import firebase_service
from app.services.redis_service import redis_service
from app.models import BidStatus

logger = logging.getLogger(__name__)

class AnalyticsService:
    """Service for analytics operations"""

    def __init__(self):
        self.db = firebase_service.db
        if not self.db:
            logger.warning("⚠️ Firebase not connected - Analytics service will return empty data")

    async def get_procurement_trends(self) -> Dict[str, Any]:
        """
        Get procurement trends and metrics
        Returns:
            dict: {
                "avg_reduction": float,
                "total_savings": float,
                "volume": int
            }
        """
        try:
            # Try cache first
            cached = await redis_service.get_json('procurement_trends')
            if cached:
                return cached

            if not self.db:
                return {"avg_reduction": 0.0, "total_savings": 0.0, "volume": 0}

            # Fetch all indents
            indents_ref = self.db.collection('indents')
            docs = indents_ref.stream()

            total_estimated_price = 0.0
            total_savings = 0.0
            volume = 0

            for doc in docs:
                data = doc.to_dict()
                volume += 1
                
                estimated_price = data.get('estimatedPrice', 0.0)
                lowest_bid = data.get('lowestBid')
                status = data.get('status')

                # Calculate savings only for awarded or in-progress indents with valid bids
                if lowest_bid and status in [BidStatus.BID_AWARDED.value, BidStatus.IN_PROGRESS.value]:
                    savings = max(0, estimated_price - lowest_bid)
                    total_savings += savings
                    total_estimated_price += estimated_price

            avg_reduction = 0.0
            if total_estimated_price > 0:
                avg_reduction = (total_savings / total_estimated_price) * 100

            result = {
                "avg_reduction": round(avg_reduction, 2),
                "total_savings": round(total_savings, 2),
                "volume": volume
            }
            
            # Cache result for 5 minutes
            await redis_service.set_json('procurement_trends', result, ttl=300)
            return result

        except Exception as e:
            logger.error(f"Error calculating procurement trends: {str(e)}")
            return {"avg_reduction": 0.0, "total_savings": 0.0, "volume": 0}

    async def get_dashboard_metrics(self) -> Dict[str, Any]:
        """
        Get dashboard metrics
        Returns:
            dict: {
                "totalIndents": int,
                "activeIndents": int,
                "closedIndents": int,
                "awardedIndents": int,
                "totalBids": int,
                "avgReduction": float,
                "totalSavings": float
            }
        """
        try:
            # Try cache first
            cached = await redis_service.get_json('dashboard_metrics')
            if cached:
                return cached

            if not self.db:
                return {
                    "totalIndents": 0, "activeIndents": 0, "closedIndents": 0, 
                    "awardedIndents": 0, "totalBids": 0, "avgReduction": 0.0, "totalSavings": 0.0
                }

            # Fetch all indents
            indents_ref = self.db.collection('indents')
            indent_docs = list(indents_ref.stream())

            # Fetch total bids count
            bids_ref = self.db.collection('bids')
            bids_docs = bids_ref.select([]).stream()
            total_bids = sum(1 for _ in bids_docs)

            total_indents = 0
            active_indents = 0
            closed_indents = 0
            awarded_indents = 0
            
            total_estimated_price = 0.0
            total_savings = 0.0

            for doc in indent_docs:
                data = doc.to_dict()
                total_indents += 1
                status = data.get('status')

                if status in [BidStatus.BID_INVITED.value, BidStatus.IN_PROGRESS.value, BidStatus.RE_BID.value]:
                    active_indents += 1
                elif status == BidStatus.BID_CLOSED.value:
                    closed_indents += 1
                elif status == BidStatus.BID_AWARDED.value:
                    awarded_indents += 1
                    closed_indents += 1 # Awarded is also logically closed as a process

                # Savings calculation
                estimated_price = data.get('estimatedPrice', 0.0)
                lowest_bid = data.get('lowestBid')
                
                if lowest_bid and status in [BidStatus.BID_AWARDED.value, BidStatus.IN_PROGRESS.value]:
                    savings = max(0, estimated_price - lowest_bid)
                    total_savings += savings
                    total_estimated_price += estimated_price

            avg_reduction = 0.0
            if total_estimated_price > 0:
                avg_reduction = (total_savings / total_estimated_price) * 100

            result = {
                "totalIndents": total_indents,
                "activeIndents": active_indents,
                "closedIndents": closed_indents,
                "awardedIndents": awarded_indents,
                "totalBids": total_bids,
                "avgReduction": round(avg_reduction, 2),
                "totalSavings": round(total_savings, 2)
            }
            
            # Cache result for 5 minutes
            await redis_service.set_json('dashboard_metrics', result, ttl=300)
            return result

        except Exception as e:
            logger.error(f"Error calculating dashboard metrics: {str(e)}")
            return {
                "totalIndents": 0, "activeIndents": 0, "closedIndents": 0, 
                "awardedIndents": 0, "totalBids": 0, "avgReduction": 0.0, "totalSavings": 0.0
            }


# Singleton instance
analytics_service = AnalyticsService()
