import React, { useState } from 'react';
import { Indent, BidStatus } from '../types';
import { MapPin, ExternalLink, IndianRupee, Calendar } from 'lucide-react';

interface WorkflowListProps {
  indents: Indent[];
  onCardClick: (indent: Indent) => void;
  isVendorView?: boolean;
  onBidSubmit?: (indentId: string, amount: number) => void;
  vendorId?: string;
  vendorName?: string;
}

const WorkflowList: React.FC<WorkflowListProps> = ({ indents, onCardClick, isVendorView, onBidSubmit, vendorId, vendorName }) => {
  const [bidInputs, setBidInputs] = useState<Record<string, string>>({});

  if (indents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border-2 border-dashed border-gray-100 text-gray-300 font-black uppercase tracking-widest">
        No matching records found
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 text-gray-500 text-[9px] font-black uppercase tracking-widest border-b border-gray-100">
              <th className="px-6 py-4">Placement Date</th>
              <th className="px-6 py-4">From - To</th>
              <th className="px-6 py-4">Vehicle Type</th>
              <th className="px-6 py-4 text-right">Reserve Price</th>
              <th className="px-6 py-4 text-center">Lowest Bid & Vendor</th>
              <th className="px-6 py-4 text-right">Savings</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {indents.map((indent) => {
              const savings = indent.lowestBid ? indent.estimatedPrice - indent.lowestBid : 0;
              const savingsPct = indent.lowestBid ? (savings / indent.estimatedPrice) * 100 : 0;

              // Privacy Logic: Mask vendor name if current user is a vendor and it's not them
              const displayLowestVendorName = isVendorView 
                ? (indent.lowestBidVendorName === vendorName ? indent.lowestBidVendorName : 'Other Vendor')
                : (indent.lowestBidVendorName || '');

              return (
                <tr key={indent.id} className="hover:bg-blue-50/10 transition-colors group">
                  {/* 1. Placement Date */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-blue-600">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-tighter">
                        {new Date(indent.placementDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </td>

                  {/* 2. From - To */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 max-w-[200px]">
                      <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                      <span className="text-xs font-black text-gray-900 uppercase tracking-tighter truncate">{indent.lane.source} → {indent.lane.destination}</span>
                    </div>
                  </td>

                  {/* 3. Vehicle Type */}
                  <td className="px-6 py-5">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight truncate max-w-[140px]">{indent.vehicleType}</p>
                  </td>

                  {/* 4. Reserve Price */}
                  <td className="px-6 py-5 text-right tabular-nums">
                    <span className="text-xs font-black text-gray-700">₹{indent.estimatedPrice.toLocaleString()}</span>
                  </td>

                  {/* 5. Lowest Bid & Vendor */}
                  <td className="px-6 py-5 text-center tabular-nums">
                    <div className="inline-flex flex-col items-center">
                      <span className="text-xs font-black text-blue-600">₹{indent.lowestBid?.toLocaleString() || '---'}</span>
                      {displayLowestVendorName && (
                        <span className="text-[8px] font-black text-slate-400 uppercase truncate max-w-[100px]">
                          {displayLowestVendorName}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 6. Savings */}
                  <td className="px-6 py-5 text-right tabular-nums">
                    {savings > 0 ? (
                      <div className="inline-flex flex-col items-end">
                        <span className="text-xs font-black text-green-600">₹{savings.toLocaleString()}</span>
                        <span className="text-[8px] font-bold text-green-500 uppercase">{savingsPct.toFixed(1)}% Reduction</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-300">---</span>
                    )}
                  </td>

                  <td className="px-6 py-5 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider border ${
                      indent.status === BidStatus.BID_INVITED ? 'bg-slate-50 text-slate-500 border-slate-200' :
                      indent.status === BidStatus.IN_PROGRESS ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      'bg-green-50 text-green-600 border-green-100'
                    }`}>
                      {indent.status}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isVendorView && (indent.status === BidStatus.BID_INVITED || indent.status === BidStatus.IN_PROGRESS) && (
                        <div className="flex gap-2 mr-2">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                            <input 
                              type="number" 
                              placeholder="Enter Quote" 
                              className="w-40 pl-7 pr-3 py-2 text-sm font-black text-slate-900 bg-white border border-slate-300 rounded-xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all placeholder:text-slate-300"
                              value={bidInputs[indent.id] || ''}
                              onChange={(e) => setBidInputs({...bidInputs, [indent.id]: e.target.value})}
                            />
                          </div>
                          <button 
                            onClick={() => {
                              if (onBidSubmit && bidInputs[indent.id]) {
                                onBidSubmit(indent.id, parseInt(bidInputs[indent.id]));
                                setBidInputs({...bidInputs, [indent.id]: ''});
                              }
                            }}
                            className="px-4 bg-blue-600 text-white text-[10px] font-black rounded-xl hover:bg-blue-800 transition-all active:scale-95 uppercase tracking-widest shadow-lg shadow-blue-900/10 flex items-center gap-2"
                          >
                            <IndianRupee className="w-3.5 h-3.5" />
                            Submit
                          </button>
                        </div>
                      )}
                      <button 
                        onClick={() => onCardClick(indent)}
                        className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkflowList;