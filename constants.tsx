import React from 'react';
import { LayoutDashboard, BarChart3, Key } from 'lucide-react';
import { BidStatus, Lane, Indent, Vendor } from './types';

export const COLORS = {
  primary: '#1e40af', 
  invited: '#f1f5f9',
  progress: '#eff6ff',
  closed: '#fef2f2',
  awarded: '#f0fdf4',
  rebid: '#fff7ed'
};

export const MOCK_LANES: Lane[] = [
  { id: 'L1', source: 'Mumbai', destination: 'Bangalore', distanceKm: 980 },
  { id: 'L2', source: 'Mumbai', destination: 'Chennai', distanceKm: 1330 },
  { id: 'L3', source: 'Delhi', destination: 'Kolkata', distanceKm: 1530 },
  { id: 'L4', source: 'Pune', destination: 'Hyderabad', distanceKm: 560 },
  { id: 'L5', source: 'Gurgaon', destination: 'Ahmedabad', distanceKm: 950 },
];

export const MOCK_VENDORS: Vendor[] = [
  { id: 'V1', name: 'Safe Logistics India', rating: 4.8, assignedLanes: ['L1', 'L2'] },
  { id: 'V2', name: 'Agarwal Cargo Movers', rating: 4.5, assignedLanes: ['L1', 'L3'] },
  { id: 'V3', name: 'Bombay Motor Transport', rating: 4.2, assignedLanes: ['L2', 'L4'] },
  { id: 'V4', name: 'Gati Logistics', rating: 4.7, assignedLanes: ['L1', 'L2', 'L3', 'L4', 'L5'] },
];

export const MOCK_INDENTS: Indent[] = [
  {
    id: 'TR001',
    requestId: 'TR-99106',
    lane: MOCK_LANES[3],
    vehicleType: '20 FT Container',
    placementDate: '2025-05-15T10:00:00',
    cutoffTime: '2025-05-15T18:00:00',
    status: BidStatus.IN_PROGRESS,
    product: 'B2B',
    weight: 3500,
    estimatedPrice: 28000,
    lowestBid: 25500,
    lowestBidVendorName: 'DTDC',
    bidCount: 4
  },
  {
    id: 'TR002',
    requestId: 'TR-99101',
    lane: MOCK_LANES[0],
    vehicleType: '32 FT SXL',
    placementDate: '2025-05-16T09:00:00',
    cutoffTime: '2025-05-16T14:00:00',
    status: BidStatus.BID_INVITED,
    product: 'E-COM',
    weight: 7000,
    estimatedPrice: 42000,
    lowestBid: 38000,
    lowestBidVendorName: 'DELHIVERY',
    bidCount: 2
  },
  {
    id: 'TR003',
    requestId: 'TR-99102',
    lane: MOCK_LANES[2],
    vehicleType: 'Bolero',
    placementDate: new Date().toISOString(), 
    cutoffTime: '2026-01-12T15:00:00',
    status: BidStatus.BID_AWARDED,
    product: 'DS',
    weight: 1200,
    vendorName: 'Safe Logistics India',
    estimatedPrice: 15000,
    lowestBid: 14200,
    lowestBidVendorName: 'Safe Logistics India',
    bidCount: 5,
    winnerVendorId: 'V1'
  },
  {
    id: 'TR004',
    requestId: 'TR-99103',
    lane: MOCK_LANES[4],
    vehicleType: '32 FT MXL',
    placementDate: '2025-05-10T11:00:00',
    cutoffTime: '2025-05-10T15:00:00',
    status: BidStatus.BID_CLOSED,
    product: 'RETAIL',
    weight: 2500,
    estimatedPrice: 35000,
    lowestBid: 32000,
    lowestBidVendorName: 'Gati Logistics',
    bidCount: 8,
    winnerVendorId: 'V4'
  },
  {
    id: 'TR005',
    requestId: 'TR-99112',
    lane: MOCK_LANES[1],
    vehicleType: 'Tata Ace',
    placementDate: '2025-05-18T14:00:00',
    cutoffTime: '2025-05-18T20:00:00',
    status: BidStatus.RE_BID,
    product: 'B2B',
    weight: 800,
    estimatedPrice: 8000,
    lowestBid: 7200,
    lowestBidVendorName: 'BLUE DART',
    bidCount: 1
  }
];

export const TOP_NAV_ITEMS = [
  { name: 'WORKFLOW', icon: <LayoutDashboard className="w-4 h-4" /> },
  { name: 'TRENDS', icon: <BarChart3 className="w-4 h-4" /> },
  { name: 'API & INTEGRATION', icon: <Key className="w-4 h-4" /> },
];