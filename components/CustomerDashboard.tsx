
import React from 'react';
import { Indent, BidStatus, ViewMode } from '../types';
import { LayoutPanelTop, TrendingDown, Target, UserCheck } from 'lucide-react';

interface CustomerDashboardProps {
  indents: Indent[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ indents }) => {
  const totalSavings = indents.reduce((acc, curr) => {
    if (curr.lowestBid) return acc + (curr.estimatedPrice - curr.lowestBid);
    return acc;
  }, 0);
  
  const totalEstimated = indents.reduce((acc, curr) => acc + curr.estimatedPrice, 0);
  const avgReduction = totalEstimated > 0 ? (totalSavings / totalEstimated) * 100 : 0;

  const stats = [
    { 
      label: 'TOTAL INDENTS', 
      value: indents.length, 
      color: 'bg-[#1e40af] text-white',
      sub: 'All time volume'
    },
    { 
      label: 'BIDS RECEIVED', 
      value: indents.reduce((acc, curr) => acc + curr.bidCount, 0), 
      color: 'bg-white text-gray-800',
      icon: <Target className="w-3 h-3 text-blue-500" />
    },
    { 
      label: 'AVG. REDUCTION', 
      value: `${avgReduction.toFixed(1)}%`, 
      color: 'bg-white text-gray-800',
      icon: <TrendingDown className="w-3 h-3 text-green-500" />
    },
    { 
      label: 'AWARDED', 
      value: indents.filter(i => i.status === BidStatus.BID_AWARDED).length, 
      color: 'bg-white text-gray-800',
      icon: <UserCheck className="w-3 h-3 text-indigo-500" />
    },
    { 
      label: 'ACTIVE OPS', 
      value: indents.filter(i => i.status === BidStatus.IN_PROGRESS || i.status === BidStatus.BID_INVITED).length, 
      color: 'bg-white text-gray-500' 
    },
    { 
      label: 'BID CLOSED', 
      value: indents.filter(i => i.status === BidStatus.BID_CLOSED).length, 
      color: 'bg-white text-gray-500' 
    },
    { 
      label: 'RE-BID REQ.', 
      value: indents.filter(i => i.status === BidStatus.RE_BID).length, 
      color: 'bg-white text-gray-500' 
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-extrabold text-gray-400 tracking-[0.15em] uppercase">PROCUREMENT PULSE</h3>
        <div className="flex items-center gap-2 px-4 py-1.5 bg-[#f0fdfa] rounded-full border border-[#ccfbf1]">
          <span className="w-2 h-2 bg-[#10b981] rounded-full"></span>
          <span className="text-[10px] font-extrabold text-[#047857] uppercase">{indents.length} TOTAL INDENTS</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className={`${stat.color} rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col items-center justify-center h-24 transition-all hover:-translate-y-1`}>
            <div className="flex items-center gap-1.5 mb-1 opacity-80 uppercase tracking-tighter">
              {stat.icon}
              <span className="text-[9px] font-extrabold text-center leading-tight">{stat.label}</span>
            </div>
            <span className={`text-2xl font-black`}>{stat.value}</span>
            {stat.sub && <span className="text-[8px] font-bold opacity-60 mt-0.5">{stat.sub}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerDashboard;
