export enum BidStatus {
  BID_INVITED = 'Bid Invited',
  IN_PROGRESS = 'In Progress',
  BID_CLOSED = 'Bid Closed',
  BID_AWARDED = 'Bid Awarded',
  RE_BID = 'Re-Bid'
}

export enum UserRole {
  CUSTOMER = 'Customer',
  VENDOR = 'Vendor',
  ADMIN = 'Admin'
}

export type ViewMode = 'board' | 'list';

export interface Lane {
  id: string;
  source: string;
  destination: string;
  distanceKm: number;
}

export interface Vendor {
  id: string;
  name: string;
  rating: number;
  assignedLanes: string[]; // Lane IDs
}

export interface Indent {
  id: string;
  requestId: string;
  lane: Lane;
  vehicleType: string;
  vehicleCapacity?: string; // e.g. "15 MT", "20 Tons"
  placementDate: string;
  cutoffTime: string;
  status: BidStatus;
  product: string;
  weight: number; // In Metric Tons (MT)
  notes?: string;
  estimatedPrice: number; // The "Reserve Price"
  lowestBid?: number;
  lowestBidVendorName?: string;
  bidCount: number;
  winnerVendorId?: string;
  vendorName?: string;

  // Enterprise Bidding Fields
  bidStartTime?: string; // ISO Date 
  bidEndTime?: string;   // ISO Date
  bidMode?: 'OPEN' | 'INVITE_ONLY';
  invitedVendorIds?: string[]; // IDs of vendors if INVITE_ONLY
  maxRebidAllowed?: number;    // Limit per vendor
  revealPriceAfter?: string;   // For Blind -> Semi-Blind Phase (ISO string)
  vehicleDetails?: {
    number: string;
    driverName: string;
    driverContact: string;
  };
}

export interface Bid {
  id: string;
  indentId: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  timestamp: string;
  rank?: number;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  status: 'Active' | 'Revoked';
}