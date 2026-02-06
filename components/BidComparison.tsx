
import React, { useMemo } from 'react';
import { Indent, Bid } from '../types';
import { ArrowLeft, Award, RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface BidComparisonProps {
  indent: Indent;
  bids: Bid[];
  onBack: () => void;
  onAssign: (vendorId: string, amount: number) => void;
}

const BidComparison: React.FC<BidComparisonProps> = ({ indent, bids, onBack, onAssign }) => {
  const sortedBids = useMemo(() => {
    return [...bids].sort((a, b) => a.amount - b.amount).map((bid, index) => ({
      ...bid,
      rank: index + 1
    }));
  }, [bids]);

  const l1Bid = sortedBids[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-all">
            <RefreshCw className="w-4 h-4" />
            Request Re-Bid
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Indent Summary Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Request Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="text-gray-500 text-sm">Request ID</span>
              <span className="text-gray-900 font-semibold text-sm">{indent.requestId}</span>
            </div>
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="text-gray-500 text-sm">Lane</span>
              <span className="text-gray-900 font-semibold text-sm">{indent.lane.source} → {indent.lane.destination}</span>
            </div>
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="text-gray-500 text-sm">Vehicle Type</span>
              <span className="text-gray-900 font-semibold text-sm">{indent.vehicleType}</span>
            </div>
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="text-gray-500 text-sm">Weight</span>
              <span className="text-gray-900 font-semibold text-sm">{indent.weight} KG</span>
            </div>
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="text-gray-500 text-sm">Cutoff Time</span>
              <span className="text-gray-900 font-semibold text-sm">{new Date(indent.cutoffTime).toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-8 p-4 bg-orange-50 border border-orange-100 rounded-lg">
            <p className="text-orange-800 font-bold text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Bidding Status
            </p>
            <p className="text-xs text-orange-700 mt-1">Live updates are being pushed to your screen. Comparison logic: Lowest Rate (L1).</p>
          </div>
        </div>

        {/* Bids List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-gray-800">Bid Submissions ({bids.length})</h3>
            <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded uppercase">Live</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4">Rate (₹)</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedBids.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">No bids submitted yet...</td>
                  </tr>
                ) : (
                  sortedBids.map((bid) => (
                    <tr key={bid.id} className={`hover:bg-gray-50 transition-colors ${bid.rank === 1 ? 'bg-blue-50/20' : ''}`}>
                      <td className="px-6 py-4">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          bid.rank === 1 ? 'bg-yellow-100 text-yellow-700' : 
                          bid.rank === 2 ? 'bg-gray-200 text-gray-700' : 
                          'bg-gray-100 text-gray-500'
                        }`}>
                          L{bid.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 text-sm">{bid.vendorName}</td>
                      <td className="px-6 py-4 text-sm font-bold text-blue-700">₹ {bid.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-xs text-gray-500">{bid.timestamp}</td>
                      <td className="px-6 py-4">
                        {bid.rank === 1 ? (
                          <span className="flex items-center gap-1 text-[10px] text-green-600 font-bold uppercase">
                            <CheckCircle className="w-3 h-3" />
                            Lowest
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-bold uppercase">
                            +₹{(bid.amount - l1Bid.amount).toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => onAssign(bid.vendorId, bid.amount)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            bid.rank === 1 
                              ? 'bg-blue-600 text-white hover:bg-blue-700' 
                              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {bid.rank === 1 ? 'Accept L1' : 'Assign Special'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {sortedBids.length > 0 && (
            <div className="p-6 bg-blue-50/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-bold">Important Notice:</p>
                <p>Assigning to a vendor other than L1 requires internal approval from the logistics manager. Please ensure a valid reason is provided in the next step if choosing L2 or higher.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BidComparison;
