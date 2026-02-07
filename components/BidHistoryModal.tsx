import React, { useState } from 'react';
import { Indent, Bid, UserRole, BidStatus } from '../types';
import { X, Clock, History, TrendingDown, User, IndianRupee, Send } from 'lucide-react';

interface BidHistoryModalProps {
  indent: Indent;
  bids: Bid[];
  onClose: () => void;
  currentUser: { role: UserRole; id: string; name: string };
  onBidSubmit?: (indentId: string, amount: number) => void;
  onAwardIndent?: (indentId: string, vendorId: string, vendorName: string, amount: number) => void;
}

const BidHistoryModal: React.FC<BidHistoryModalProps> = ({ indent, bids, onClose, currentUser, onBidSubmit, onAwardIndent }) => {
  const [bidAmount, setBidAmount] = useState('');

  // Sort by Amount ASC (Lowest First), then by Timestamp DESC (Newest First)
  const sortedBids = [...bids].sort((a, b) => {
    if (a.amount !== b.amount) return a.amount - b.amount;
    return b.timestamp.localeCompare(a.timestamp);
  });

  const handleModalBid = () => {
    const amount = parseInt(bidAmount);
    if (!amount) return;

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
      onBidSubmit(indent.id, amount);
      setBidAmount('');
    }
  };

  const [timeLeft, setTimeLeft] = useState<string>('');

  // Countdown Timer Logic
  React.useEffect(() => {
    if (!indent.bidEndTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(indent.bidEndTime!);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Bidding Closed');
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [indent.bidEndTime]);

  // Check if bidding is allowed based on time
  const isTimeValid = () => {
    if (!indent.bidStartTime && !indent.bidEndTime) return true; // Legacy support
    const now = new Date();
    if (indent.bidStartTime && new Date(indent.bidStartTime) > now) return false;
    if (indent.bidEndTime && new Date(indent.bidEndTime) < now) return false;
    return true;
  };

  const isBiddable = currentUser.role === UserRole.VENDOR &&
    (indent.status === BidStatus.BID_INVITED || indent.status === BidStatus.IN_PROGRESS || indent.status === BidStatus.RE_BID) &&
    isTimeValid();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#1e40af] px-8 py-6 flex items-center justify-between text-white">
          <div>
            <div className="flex items-center gap-3">
              <History className="w-6 h-6 text-blue-200" />
              <h2 className="text-xl font-black uppercase tracking-tight">Bid History</h2>
            </div>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-blue-100/70 text-xs font-bold uppercase tracking-wider">{indent.requestId} • {indent.lane.source} to {indent.lane.destination}</p>
              {timeLeft && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/30 rounded-lg border border-blue-400/30">
                  <Clock className="w-3 h-3 text-blue-200" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{timeLeft}</span>
                </div>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Summary KPIs */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Bids</p>
              <p className="text-2xl font-black text-slate-900">{bids.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-2xl border border-green-100 text-center">
              <p className="text-[10px] font-black text-green-400 uppercase mb-1">Lowest (L1)</p>
              <p className="text-2xl font-black text-green-700">₹{indent.lowestBid?.toLocaleString() || '---'}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center">
              <p className="text-[10px] font-black text-blue-400 uppercase mb-1">Vehicle</p>
              <p className="text-xs font-black text-blue-900 leading-tight uppercase">{indent.vehicleType}</p>
            </div>
          </div>

          {/* New Bid Section for Vendors */}
          {isBiddable && (
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
                  <IndianRupee className="w-4 h-4" />
                  Place Counter Offer
                </h3>
                <span className="text-[10px] font-bold text-blue-600 uppercase">Live Marketplace</span>
              </div>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    placeholder="Enter your lowest quote..."
                    className="w-full pl-8 pr-4 py-4 bg-white border border-blue-200 rounded-2xl text-lg font-black text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder:text-slate-300"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleModalBid}
                  disabled={!bidAmount}
                  className="px-8 bg-blue-600 text-white text-xs font-black rounded-2xl hover:bg-blue-800 disabled:opacity-50 transition-all active:scale-95 uppercase tracking-widest shadow-xl shadow-blue-900/10 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit
                </button>
              </div>
              <p className="text-[9px] font-bold text-blue-700/60 uppercase text-center tracking-wider italic">
                Your bid will be immediately broadcasted to the customer dashboard.
              </p>
            </div>
          )}

          {/* History Timeline */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Real-time Submissions
            </h3>

            <div className="relative border-l-2 border-slate-100 ml-4 pl-8 space-y-6">
              {sortedBids.length === 0 ? (
                <div className="py-12 text-center text-slate-300 italic font-bold uppercase text-xs">
                  No bids have been submitted yet.
                </div>
              ) : (
                sortedBids.map((bid, index) => {
                  const isLowest = index === 0;

                  // Privacy Logic: Mask vendor name if current user is a vendor and it's not them
                  const displayVendorName = currentUser.role === UserRole.VENDOR
                    ? (bid.vendorName === currentUser.name ? bid.vendorName : 'Competitor Vendor')
                    : bid.vendorName;

                  return (
                    <div key={bid.id} className="relative">
                      {/* Timeline Dot */}
                      <div className={`absolute -left-[41px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-4 border-white shadow-md z-10 transition-all ${isLowest ? 'bg-green-500 scale-125' : 'bg-slate-300'}`}></div>

                      <div className={`p-5 rounded-2xl border-2 transition-all ${isLowest ? 'bg-green-50/60 border-green-500 shadow-lg scale-[1.02]' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                        {isLowest && (
                          <div className="absolute -top-3 left-6 px-3 py-1 bg-green-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm">
                            🏆 Current Winner (L1)
                          </div>
                        )}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <User className={`w-4 h-4 ${isLowest ? 'text-green-600' : 'text-slate-400'}`} />
                            <span className={`text-sm font-black ${isLowest ? 'text-green-900' : 'text-slate-900'}`}>{displayVendorName}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{bid.timestamp}</span>
                        </div>

                        <div className="flex items-end justify-between">
                          <div className={`flex items-baseline gap-1 ${isLowest ? 'text-green-700' : 'text-slate-900'}`}>
                            <span className="text-2xl font-black">₹{bid.amount.toLocaleString()}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase">per load</span>
                          </div>

                          {isLowest ? (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-100 rounded-lg text-[10px] font-black text-green-700 uppercase tracking-wider">
                              <TrendingDown className="w-3 h-3" />
                              Best Price
                            </div>
                          ) : (
                            <div className="text-[10px] font-black text-red-400 uppercase bg-red-50 px-2 py-1 rounded-lg">
                              +₹{(bid.amount - sortedBids[0].amount).toLocaleString()} higher
                            </div>
                          )}
                        </div>
                        {/* Award Action for Customer */}
                        {currentUser.role === UserRole.CUSTOMER &&
                          (indent.status === BidStatus.BID_INVITED || indent.status === BidStatus.IN_PROGRESS || indent.status === BidStatus.RE_BID) && (
                            <div className="mt-3 flex justify-end">
                              <button
                                onClick={() => {
                                  if (onAwardIndent) {
                                    if (window.confirm(`Are you sure you want to award this contract to ${bid.vendorName} for ₹${bid.amount.toLocaleString()}?`)) {
                                      onAwardIndent(indent.id, bid.vendorId, bid.vendorName, bid.amount);
                                      onClose();
                                    }
                                  }
                                }}
                                className="px-4 py-2 bg-green-600 text-white text-[10px] font-black rounded-xl hover:bg-green-700 shadow-lg transition-all uppercase tracking-widest flex items-center gap-2"
                              >
                                <TrendingDown className="w-3 h-3" />
                                Award Contract
                              </button>
                            </div>
                          )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-[#1e40af] text-white text-xs font-black rounded-2xl hover:bg-blue-800 shadow-lg shadow-blue-900/20 transition-all active:scale-95 uppercase tracking-widest"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default BidHistoryModal;