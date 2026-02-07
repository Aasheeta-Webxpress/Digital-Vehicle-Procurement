"""
Analytics Service - Business logic for analytics and reporting
"""
import logging
from typing import Dict, Any
from app.services.firebase_service import firebase_service
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

            return {
                "avg_reduction": round(avg_reduction, 2),
                "total_savings": round(total_savings, 2),
                "volume": volume
            }

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

            return {
                "totalIndents": total_indents,
                "activeIndents": active_indents,
                "closedIndents": closed_indents,
                "awardedIndents": awarded_indents,
                "totalBids": total_bids,
                "avgReduction": round(avg_reduction, 2),
                "totalSavings": round(total_savings, 2)
            }

        except Exception as e:
            logger.error(f"Error calculating dashboard metrics: {str(e)}")
            return {
                "totalIndents": 0, "activeIndents": 0, "closedIndents": 0, 
                "awardedIndents": 0, "totalBids": 0, "avgReduction": 0.0, "totalSavings": 0.0
            }
    
    async def get_savings_report(self, start_date: str = None, end_date: str = None) -> Dict[str, Any]:
        """
        Generate comprehensive savings and performance report
        
        Args:
            start_date: Optional start date filter (ISO format)
            end_date: Optional end date filter (ISO format)
        
        Returns:
            dict: {
                "totalExpected": float,
                "totalActual": float,
                "totalSavings": float,
                "savingsPercent": float,
                "topVendors": [{"vendorId": str, "vendorName": str, "savings": float}]
            }
        """
        try:
            if not self.db:
                return {
                    "totalExpected": 0, "totalActual": 0, "totalSavings": 0,
                    "savingsPercent": 0, "topVendors": []
                }
            
            # Fetch awarded indents
            indents_ref = self.db.collection('indents')
            query = indents_ref.where('status', '==', BidStatus.BID_AWARDED.value)
            
            # Apply date filters if provided
            if start_date:
                query = query.where('placementDate', '>=', start_date)
            if end_date:
                query = query.where('placementDate', '<=', end_date)
            
            docs = list(query.stream())
            
            total_expected = 0.0
            total_actual = 0.0
            vendor_savings = {}  # {vendorId: {name: str, savings: float}}
            
            for doc in docs:
                data = doc.to_dict()
                estimated = data.get('estimatedPrice', 0)
                actual = data.get('lowestBid', estimated)
                
                total_expected += estimated
                total_actual += actual
                
                # Track vendor savings
                if data.get('winnerVendorId'):
                    vendor_id = data['winnerVendorId']
                    vendor_name = data.get('vendorName', 'Unknown')
                    saving = estimated - actual
                    
                    if vendor_id not in vendor_savings:
                        vendor_savings[vendor_id] = {
                            'vendorId': vendor_id,
                            'vendorName': vendor_name,
                            'savings': 0
                        }
                    vendor_savings[vendor_id]['savings'] += saving
            
            total_savings = total_expected - total_actual
            savings_percent = (total_savings / total_expected * 100) if total_expected > 0 else 0
            
            # Sort vendors by savings (descending) and get top 5
            top_vendors = sorted(
                vendor_savings.values(),
                key=lambda x: x['savings'],
                reverse=True
            )[:5]
            
            return {
                "totalExpected": round(total_expected, 2),
                "totalActual": round(total_actual, 2),
                "totalSavings": round(total_savings, 2),
                "savingsPercent": round(savings_percent, 2),
                "topVendors": top_vendors
            }
        
        except Exception as e:
            logger.error(f"Error generating savings report: {str(e)}")
            return {
                "totalExpected": 0, "totalActual": 0, "totalSavings": 0,
                "savingsPercent": 0, "topVendors": []
            }


# Singleton instance
analytics_service = AnalyticsService()
