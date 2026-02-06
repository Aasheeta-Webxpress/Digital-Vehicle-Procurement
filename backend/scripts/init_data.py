"""
Data Initialization Script
Populates Firebase with initial mock data
"""
import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.firebase_service import firebase_service
from app.models import BidStatus
from datetime import datetime, timedelta
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Mock data
MOCK_LANES = [
    {"id": "L1", "source": "Mumbai", "destination": "Bangalore", "distanceKm": 980, "isActive": True},
    {"id": "L2", "source": "Mumbai", "destination": "Chennai", "distanceKm": 1330, "isActive": True},
    {"id": "L3", "source": "Delhi", "destination": "Kolkata", "distanceKm": 1530, "isActive": True},
    {"id": "L4", "source": "Pune", "destination": "Hyderabad", "distanceKm": 560, "isActive": True},
    {"id": "L5", "source": "Gurgaon", "destination": "Ahmedabad", "distanceKm": 950, "isActive": True},
]

MOCK_VENDORS = [
    {
        "id": "V1",
        "name": "Safe Logistics India",
        "email": "contact@safelogistics.in",
        "phone": "+91-9876543210",
        "rating": 4.8,
        "assignedLanes": ["L1", "L2"],
        "totalBids": 0,
        "totalAwards": 0,
        "winRate": 0.0,
        "totalRevenue": 0.0,
        "isActive": True
    },
    {
        "id": "V2",
        "name": "Agarwal Cargo Movers",
        "email": "info@agarwalcargo.com",
        "phone": "+91-9876543211",
        "rating": 4.5,
        "assignedLanes": ["L1", "L3"],
        "totalBids": 0,
        "totalAwards": 0,
        "winRate": 0.0,
        "totalRevenue": 0.0,
        "isActive": True
    },
    {
        "id": "V3",
        "name": "Bombay Motor Transport",
        "email": "support@bmtransport.in",
        "phone": "+91-9876543212",
        "rating": 4.2,
        "assignedLanes": ["L2", "L4"],
        "totalBids": 0,
        "totalAwards": 0,
        "winRate": 0.0,
        "totalRevenue": 0.0,
        "isActive": True
    },
    {
        "id": "V4",
        "name": "Gati Logistics",
        "email": "contact@gatilogistics.com",
        "phone": "+91-9876543213",
        "rating": 4.7,
        "assignedLanes": ["L1", "L2", "L3", "L4", "L5"],
        "totalBids": 0,
        "totalAwards": 0,
        "winRate": 0.0,
        "totalRevenue": 0.0,
        "isActive": True
    }
]

MOCK_INDENTS = [
    {
        "id": "TR001",
        "requestId": "TR-99106",
        "lane": MOCK_LANES[3],
        "vehicleType": "20 FT Container",
        "placementDate": (datetime.now() - timedelta(days=2)).isoformat(),
        "cutoffTime": (datetime.now() + timedelta(hours=6)).isoformat(),
        "status": BidStatus.IN_PROGRESS.value,
        "product": "B2B",
        "weight": 3500,
        "estimatedPrice": 28000,
        "lowestBid": 25500,
        "lowestBidVendorName": "Safe Logistics India",
        "bidCount": 4
    },
    {
        "id": "TR002",
        "requestId": "TR-99101",
        "lane": MOCK_LANES[0],
        "vehicleType": "32 FT SXL",
        "placementDate": (datetime.now() - timedelta(days=1)).isoformat(),
        "cutoffTime": (datetime.now() + timedelta(hours=12)).isoformat(),
        "status": BidStatus.BID_INVITED.value,
        "product": "E-COM",
        "weight": 7000,
        "estimatedPrice": 42000,
        "lowestBid": 38000,
        "lowestBidVendorName": "Gati Logistics",
        "bidCount": 2
    },
    {
        "id": "TR003",
        "requestId": "TR-99102",
        "lane": MOCK_LANES[2],
        "vehicleType": "Bolero",
        "placementDate": (datetime.now() - timedelta(days=10)).isoformat(),
        "cutoffTime": (datetime.now() - timedelta(days=9)).isoformat(),
        "status": BidStatus.BID_AWARDED.value,
        "product": "DS",
        "weight": 1200,
        "vendorName": "Safe Logistics India",
        "estimatedPrice": 15000,
        "lowestBid": 14200,
        "lowestBidVendorName": "Safe Logistics India",
        "bidCount": 5,
        "winnerVendorId": "V1"
    }
]


async def initialize_data():
    """Initialize Firebase with mock data"""
    
    if not firebase_service.is_connected:
        logger.error("Firebase not connected. Please configure credentials first.")
        return
    
    logger.info("Starting data initialization...")
    
    try:
        # Initialize lanes
        logger.info("Creating lanes...")
        lanes_collection = firebase_service.lanes_collection
        for lane in MOCK_LANES:
            lane_data = lane.copy()
            lane_data['createdAt'] = datetime.now().isoformat()
            lane_data['updatedAt'] = datetime.now().isoformat()
            lanes_collection.document(lane['id']).set(lane_data)
            logger.info(f"  Created lane: {lane['id']}")
        
        # Initialize vendors
        logger.info("Creating vendors...")
        vendors_collection = firebase_service.vendors_collection
        for vendor in MOCK_VENDORS:
            vendor_data = vendor.copy()
            vendor_data['createdAt'] = datetime.now().isoformat()
            vendor_data['updatedAt'] = datetime.now().isoformat()
            vendors_collection.document(vendor['id']).set(vendor_data)
            logger.info(f"  Created vendor: {vendor['id']} - {vendor['name']}")
        
        # Initialize indents
        logger.info("Creating indents...")
        indents_collection = firebase_service.indents_collection
        for indent in MOCK_INDENTS:
            indent_data = indent.copy()
            indent_data['createdAt'] = datetime.now().isoformat()
            indent_data['updatedAt'] = datetime.now().isoformat()
            indents_collection.document(indent['id']).set(indent_data)
            logger.info(f"  Created indent: {indent['id']} - {indent['requestId']}")
        
        logger.info("✅ Data initialization completed successfully!")
        logger.info(f"   - {len(MOCK_LANES)} lanes created")
        logger.info(f"   - {len(MOCK_VENDORS)} vendors created")
        logger.info(f"   - {len(MOCK_INDENTS)} indents created")
        
    except Exception as e:
        logger.error(f"❌ Error during initialization: {str(e)}")
        raise


if __name__ == "__main__":
    asyncio.run(initialize_data())
