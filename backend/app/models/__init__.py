"""
Pydantic models for data validation and serialization
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# Import user models
from app.models.user import (
    UserRegistration,
    UserLogin,
    UserMaster,
    UserResponse,
    LoginResponse
)


class BidStatus(str, Enum):
    """Bid status enumeration"""
    BID_INVITED = "Bid Invited"
    IN_PROGRESS = "In Progress"
    BID_CLOSED = "Bid Closed"
    BID_AWARDED = "Bid Awarded"
    RE_BID = "Re-Bid"


class Lane(BaseModel):
    """Lane/Route model"""
    id: str
    source: str
    destination: str
    distanceKm: int
    estimatedDuration: Optional[str] = None
    isActive: bool = True


class VehicleDetails(BaseModel):
    """Vehicle details for awarded indents"""
    number: str
    driverName: str
    driverContact: str


class Indent(BaseModel):
    """Indent (Transportation Request) model"""
    id: str
    requestId: str
    lane: Lane
    vehicleType: str
    vehicleCapacity: Optional[str] = None
    placementDate: str  # ISO format string
    cutoffTime: str  # ISO format string
    status: BidStatus
    product: str
    weight: float  # in MT
    notes: Optional[str] = None
    estimatedPrice: float
    lowestBid: Optional[float] = None
    lowestBidVendorName: Optional[str] = None
    bidCount: int = 0
    winnerVendorId: Optional[str] = None
    vendorName: Optional[str] = None
    vehicleDetails: Optional[VehicleDetails] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None


class IndentCreate(BaseModel):
    """Model for creating a new indent"""
    requestId: str
    lane: Lane
    vehicleType: str
    vehicleCapacity: Optional[str] = None
    placementDate: str
    cutoffTime: str
    product: str
    weight: float
    notes: Optional[str] = None
    estimatedPrice: float


class IndentUpdate(BaseModel):
    """Model for updating an indent"""
    status: Optional[BidStatus] = None
    lowestBid: Optional[float] = None
    lowestBidVendorName: Optional[str] = None
    bidCount: Optional[int] = None
    winnerVendorId: Optional[str] = None
    vendorName: Optional[str] = None
    vehicleDetails: Optional[VehicleDetails] = None


class Bid(BaseModel):
    """Bid model"""
    id: str
    indentId: str
    vendorId: str
    vendorName: str
    amount: float
    timestamp: str  # ISO format string
    rank: Optional[int] = None
    createdAt: Optional[str] = None


class BidCreate(BaseModel):
    """Model for creating a new bid"""
    indentId: str
    vendorId: str
    vendorName: str
    amount: float


class Vendor(BaseModel):
    """Vendor model"""
    id: str
    name: str
    email: str
    phone: str
    rating: float = Field(ge=0, le=5)  # 0-5 rating
    assignedLanes: List[str] = []
    totalBids: int = 0
    totalAwards: int = 0
    winRate: float = 0.0
    totalRevenue: float = 0.0
    isActive: bool = True
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None


class VendorCreate(BaseModel):
    """Model for creating a new vendor"""
    name: str
    email: str
    phone: str
    rating: float = Field(default=0.0, ge=0, le=5)
    assignedLanes: List[str] = []


class ApiKey(BaseModel):
    """API Key model"""
    id: str
    name: str
    key: str
    createdAt: str
    status: str  # "Active" or "Revoked"
    lastUsed: Optional[str] = None
    permissions: List[str] = ["read", "write"]


class AnalyticsTrends(BaseModel):
    """Analytics trends response model"""
    avg_reduction: float
    total_savings: float
    volume: int


class DashboardMetrics(BaseModel):
    """Dashboard metrics response model"""
    totalIndents: int
    activeIndents: int
    closedIndents: int
    awardedIndents: int
    totalBids: int
    avgReduction: float
    totalSavings: float


__all__ = [
    'BidStatus',
    'Lane',
    'VehicleDetails',
    'Indent',
    'IndentCreate',
    'IndentUpdate',
    'Bid',
    'BidCreate',
    'Vendor',
    'VendorCreate',
    'ApiKey',
    'AnalyticsTrends',
    'DashboardMetrics',
    'UserRegistration',
    'UserLogin',
    'UserMaster',
    'UserResponse',
    'LoginResponse'
]
