import React, { useState } from 'react';
import { Indent, BidStatus, UserRole } from '../types';
import { Truck, MapPin, Calendar, Plus, Users, TrendingDown, IndianRupee } from 'lucide-react';

interface WorkflowBoardProps {
  indents: Indent[];
  onCardClick: (indent: Indent) => void;
  onAddIndent: () => void;
  currentUser: { role: UserRole; id: string; name: string };
  onBidSubmit?: (indentId: string, amount: number) => void;
}

const WorkflowBoard: React.FC<WorkflowBoardProps> = ({ indents, onCardClick, onAddIndent, currentUser, onBidSubmit }) => {
  const [bidInputs, setBidInputs] = useState<Record<string, string>>({});

  if (indents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-gray-300 font-black uppercase tracking-widest">
        No matching records found
      </div>
    );
  }

  const handleQuickBid = (e: React.MouseEvent, indentId: string) => {
    e.stopPropagation(); // Don't open the modal when clicking the button
    const amount = parseInt(bidInputs[indentId]);
    if (!amount) return;

    // Find the indent to check against
    const indent = indents.find(i => i.id === indentId);
    if (!indent) return;

    // Minimum Decrement Rule: New Bid must be at least ₹200 lower than current L1
    const currentLowest = indent.lowestBid || indent.estimatedPrice;

    if (amount >= currentLowest) {
      alert(`Bid Not Acceptable: You must enter an amount lower than the current L1 offer (₹${currentLowest.toLocaleString()}).`);
      return;
    }

    if (amount > (currentLowest - 200)) {
      alert(`Error: Please enter an amount at least ₹200 lower than L1.\n\nMaximum allowed bid: ₹${(currentLowest - 200).toLocaleString()}`);
      return;
    }

    if (onBidSubmit) {
      onBidSubmit(indentId, amount);
      setBidInputs(prev => ({ ...prev, [indentId]: '' }));
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
      {indents.map((indent) => {
        const savings = indent.lowestBid ? indent.estimatedPrice - indent.lowestBid : 0;
        const savingsPct = indent.lowestBid ? (savings / indent.estimatedPrice) * 100 : 0;

        // Privacy Logic: Mask vendor name if current user is a vendor and it's not them
        const displayLowestVendorName = currentUser.role === UserRole.VENDOR
          ? (indent.lowestBidVendorName === currentUser.name ? indent.lowestBidVendorName : 'Other Vendor')
          : (indent.lowestBidVendorName || 'Pending');

        const isBiddable = currentUser.role === UserRole.VENDOR && (indent.status === BidStatus.BID_INVITED || indent.status === BidStatus.IN_PROGRESS || indent.status === BidStatus.RE_BID);

        return (
          <div
            key={indent.id}
            onClick={() => onCardClick(indent)}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full"
          >
            {/* 1. Placement Date */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-tight">
                  {new Date(indent.placementDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${indent.status === BidStatus.BID_INVITED ? 'bg-slate-50 text-slate-500 border-slate-200' :
                    indent.status === BidStatus.IN_PROGRESS ? 'bg-blue-50 text-blue-600 border-blue-200' :
                      'bg-green-50 text-green-600 border-green-200'
                  }`}>
                  {indent.status}
                </span>
              </div>
            </div>

            {/* 2. From - To */}
            <h3 className="text-base font-black text-gray-900 mb-1 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
              <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="truncate">{indent.lane.source} → {indent.lane.destination}</span>
            </h3>

            {/* 3. Vehicle Type */}
            <div className="flex items-center gap-2 text-gray-400 mb-6 px-1">
              <Truck className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wide truncate">{indent.vehicleType}</span>
            </div>

            <div className="space-y-4 flex-1">
              {/* 4. Reserve Price */}
              <div className="flex justify-between items-center py-2 border-b border-gray-50 px-1">
                <span className="text-[9px] font-black text-gray-400 uppercase">Reserve Price</span>
                <span className="text-xs font-black text-gray-900 tabular-nums">₹{indent.estimatedPrice.toLocaleString()}</span>
              </div>

              {/* 5. Lowest Bid & Vendor */}
              <div className={`rounded-xl p-3 border transition-all ${indent.lowestBid ? 'bg-blue-50/50 border-blue-100' : 'bg-gray-50/50 border-gray-100'}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[9px] font-black text-gray-400 uppercase">Lowest Quote</span>
                  <div className="flex items-center gap-1 text-blue-600">
                    <Users className="w-3 h-3" />
                    <span className="text-[9px] font-black uppercase">{indent.bidCount} Bids</span>
                  </div>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm font-black text-blue-600 tabular-nums">₹{indent.lowestBid?.toLocaleString() || '---'}</span>
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter truncate text-right">
                    {displayLowestVendorName}
                  </span>
                </div>
              </div>

              {/* Bidding Section for Vendor */}
              {isBiddable && (
                <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                      <input
                        type="number"
                        placeholder="Your Quote"
                        className="w-full pl-7 pr-3 py-3 text-sm font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 focus:bg-white transition-all placeholder:text-slate-300"
                        value={bidInputs[indent.id] || ''}
                        onChange={(e) => setBidInputs({ ...bidInputs, [indent.id]: e.target.value })}
                      />
                    </div>
                    <button
                      onClick={(e) => handleQuickBid(e, indent.id)}
                      className="w-full py-3 bg-blue-600 text-white text-[10px] font-black rounded-xl hover:bg-blue-800 transition-all active:scale-95 uppercase tracking-widest shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2"
                    >
                      <IndianRupee className="w-3.5 h-3.5" />
                      Place Bid
                    </button>
                  </div>
                </div>
              )}

              {/* 6. Savings (Only for Customer or if no biddable section) */}
              {(!isBiddable || indent.status === BidStatus.BID_AWARDED) && (
                <div className={`flex items-center justify-between pt-2 px-1 ${!indent.lowestBid ? 'opacity-30' : ''}`}>
                  <div className="flex items-center gap-1.5">
                    <TrendingDown className={`w-3.5 h-3.5 ${savings > 0 ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Savings Realized</span>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${savings > 0 ? 'text-green-600' : 'text-gray-300'} leading-none tabular-nums`}>
                      ₹{savings > 0 ? savings.toLocaleString() : '---'}
                    </p>
                    {savings > 0 && <p className="text-[8px] font-black text-green-500/70 mt-1">{savingsPct.toFixed(1)}% Reduction</p>}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none">{indent.requestId}</span>
              <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 opacity-0 group-hover:opacity-100 transition-all">
                <Plus className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WorkflowBoard;