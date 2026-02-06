
import React, { useMemo } from 'react';
import { Indent, Bid, BidStatus } from '../types';
import { Trophy, XCircle, Clock, IndianRupee } from 'lucide-react';

interface VendorPortalProps {
  indents: Indent[];
  bids: Bid[];
  vendorId: string;
}

const VendorPortal: React.FC<VendorPortalProps> = ({ indents, bids, vendorId }) => {
  // Personalized Vendor Summary (Top Stats)
  const vendorStats = useMemo(() => {
    // Awarded: Where vendor is the winner
    const awardedIndents = indents.filter(i => i.winnerVendorId === vendorId && i.status === BidStatus.BID_AWARDED);
    const awardedAmount = awardedIndents.reduce((sum, i) => sum + (i.lowestBid || 0), 0);

    // Lost: Where vendor placed a bid but someone else won
    const lostIndents = indents.filter(i => {
      const hasMyBid = bids.some(b => b.indentId === i.id && b.vendorId === vendorId);
      return hasMyBid && i.status === BidStatus.BID_AWARDED && i.winnerVendorId !== vendorId;
    });
    const lostAmount = lostIndents.reduce((sum, i) => {
      const myLastBid = bids.filter(b => b.indentId === i.id && b.vendorId === vendorId).slice(-1)[0];
      return sum + (myLastBid?.amount || 0);
    }, 0);

    return {
      awardedCount: awardedIndents.length,
      awardedAmount,
      lostCount: lostIndents.length,
      lostAmount,
    };
  }, [indents, bids, vendorId]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
          <Trophy className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">My Awards</p>
          <p className="text-2xl font-black text-slate-900 leading-none">{vendorStats.awardedCount}</p>
          <p className="text-[10px] font-bold text-green-600 mt-1 uppercase">₹{(vendorStats.awardedAmount / 1000).toFixed(1)}K Won</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
          <XCircle className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Lost Bids</p>
          <p className="text-2xl font-black text-slate-900 leading-none">{vendorStats.lostCount}</p>
          <p className="text-[10px] font-bold text-red-400 mt-1 uppercase">₹{(vendorStats.lostAmount / 1000).toFixed(1)}K Potential</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
          <Clock className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Live Indents</p>
          <p className="text-2xl font-black text-slate-900 leading-none">
            {indents.filter(i => i.status === BidStatus.BID_INVITED || i.status === BidStatus.IN_PROGRESS).length}
          </p>
          <p className="text-[10px] font-bold text-blue-600 mt-1 uppercase">Open Market</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
          <IndianRupee className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Win Rate</p>
          <p className="text-2xl font-black text-slate-900 leading-none">
            {vendorStats.awardedCount + vendorStats.lostCount > 0 
              ? ((vendorStats.awardedCount / (vendorStats.awardedCount + vendorStats.lostCount)) * 100).toFixed(0) 
              : 0}%
          </p>
          <p className="text-[10px] font-bold text-indigo-600 mt-1 uppercase">Efficiency</p>
        </div>
      </div>
    </div>
  );
};

export default VendorPortal;
