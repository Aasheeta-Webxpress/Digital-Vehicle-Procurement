"""
Bid Intelligence Service - AI-powered bid suggestions and analytics
"""
from typing import Optional
from datetime import datetime
import logging

from app.services.firebase_service import firebase_service
from app.services.bid_service import bid_service
from app.services.indent_service import indent_service
from app.models import BidSuggestion

logger = logging.getLogger(__name__)


class BidIntelligenceService:
    """Service for intelligent bid suggestions"""
    
    @staticmethod
    async def get_bid_suggestion(indent_id: str, vendor_id: str) -> dict:
        """
        Generate smart bid suggestion for vendor
        
        Args:
            indent_id: Indent ID
            vendor_id: Vendor ID
            
        Returns:
            BidSuggestion dictionary with multiple pricing strategies
        """
        try:
            # Get indent details
            indent = await indent_service.get_indent_by_id(indent_id)
            if not indent:
                raise ValueError(f"Indent {indent_id} not found")
            
            # Get current L1 bid or estimated price
            current_l1 = indent.get('lowestBid', indent.get('estimatedPrice'))
            
            # Calculate minimum bid (L1 - 200)
            minimum_bid = current_l1 - 200
            
            # Calculate suggestion tiers
            # Conservative: Just meet minimum requirement
            conservative = minimum_bid
            
            # Competitive: 5% lower than L1
            competitive = current_l1 - (current_l1 * 0.05)
            competitive = max(competitive, minimum_bid)  # Ensure it meets minimum
            
            # Aggressive: 10% lower than L1
            aggressive = current_l1 - (current_l1 * 0.10)
            aggressive = max(aggressive, minimum_bid)  # Ensure it meets minimum
            
            # Calculate win probabilities based on bid aggressiveness
            # Get vendor's historical performance
            vendor_bids = await bid_service.get_all_bids(vendor_id=vendor_id, limit=50)
            vendor_awards = sum(1 for b in vendor_bids if b.get('isWinner', False))
            historical_win_rate = (vendor_awards / len(vendor_bids) * 100) if vendor_bids else 50
            
            # Adjust probabilities based on historical performance
            base_probability = min(historical_win_rate, 50)  # Cap base at 50%
            
            conservative_win_rate = int(base_probability + 10)  # +10% for meeting minimum
            competitive_win_rate = int(base_probability + 30)   # +30% for 5% discount
            aggressive_win_rate = int(base_probability + 45)    # +45% for 10% discount
            
            # Cap at 95%
            conservative_win_rate = min(conservative_win_rate, 60)
            competitive_win_rate = min(competitive_win_rate, 80)
            aggressive_win_rate = min(aggressive_win_rate, 95)
            
            suggestion = {
                'currentL1': current_l1,
                'minimumBid': minimum_bid,
                'conservative': round(conservative, 2),
                'competitive': round(competitive, 2),
                'aggressive': round(aggressive, 2),
                'conservativeWinRate': conservative_win_rate,
                'competitiveWinRate': competitive_win_rate,
                'aggressiveWinRate': aggressive_win_rate
            }
            
            logger.info(f"Generated bid suggestion for vendor {vendor_id} on indent {indent_id}")
            return suggestion
            
        except Exception as e:
            logger.error(f"Error generating bid suggestion: {str(e)}")
            raise
    
    @staticmethod
    async def calculate_bid_confidence(vendor_id: str, indent: dict, suggested_bid: float) -> int:
        """
        Calculate 0-100 confidence score for suggested bid
        
        Args:
            vendor_id: Vendor ID
            indent: Indent dictionary
            suggested_bid: Suggested bid amount
            
        Returns:
            Confidence score (0-100)
        """
        try:
            score = 50  # Base score
            
            # Factor 1: Historical win rate on similar routes
            db = firebase_service.db
            
            # Get vendor's past performance on this route
            route_key = f"{indent['lane']['source']}-{indent['lane']['destination']}"
            vendor_ref = db.collection('vendors').document(vendor_id)
            vendor_doc = vendor_ref.get()
            
            if vendor_doc.exists:
                vendor = vendor_doc.to_dict()
                
                # Check if vendor has good rating
                if vendor.get('rating', 0) > 4.0:
                    score += 15  # High rating bonus
                elif vendor.get('rating', 0) > 3.0:
                    score += 5   # Good rating bonus
                
                # Check on-time percentage
                if vendor.get('onTimePercent', 0) > 90:
                    score += 10  # Excellent delivery record
            
            # Factor 2: Competition level
            existing_bids = await bid_service.get_bids_for_indent(indent['id'])
            active_bidders = len(set(b['vendorId'] for b in existing_bids))
            score -= (active_bidders * 5)  # -5 per competitor
            
            # Factor 3: Time pressure
            if indent.get('biddingWindow'):
                window = indent['biddingWindow']
                end_time = datetime.fromisoformat(window['endTime'])
                time_left_minutes = (end_time - datetime.now()).total_seconds() / 60
                
                if time_left_minutes < 15:
                    score += 10  # Urgency bonus (less competition expected)
            
            # Factor 4: Bid aggressiveness
            current_l1 = indent.get('lowestBid', indent.get('estimatedPrice'))
            discount_percent = ((current_l1 - suggested_bid) / current_l1) * 100
            
            if discount_percent > 10:
                score += 20  # Very aggressive bid
            elif discount_percent > 5:
                score += 10  # Moderately aggressive
            
            # Clamp to 0-100
            final_score = max(0, min(100, score))
            
            logger.info(f"Calculated bid confidence: {final_score} for vendor {vendor_id}")
            return final_score
            
        except Exception as e:
            logger.error(f"Error calculating bid confidence: {str(e)}")
            return 50  # Return neutral score on error


bid_intelligence_service = BidIntelligenceService()
