
import React from 'react';
import { Indent, BidStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingDown, IndianRupee, PieChart as PieIcon, BarChart3 } from 'lucide-react';

interface TrendsViewProps {
  indents: Indent[];
}

const TrendsView: React.FC<TrendsViewProps> = ({ indents }) => {
  const awardedCount = indents.filter(i => i.status === BidStatus.BID_AWARDED).length;
  const closedCount = indents.filter(i => i.status === BidStatus.BID_CLOSED).length;
  const openCount = indents.length - (awardedCount + closedCount);
  
  const pieData = [
    { name: 'Awarded', value: awardedCount, color: '#10b981' },
    { name: 'Open (Bidding)', value: openCount, color: '#1e40af' },
    { name: 'Closed/Pending', value: closedCount, color: '#ef4444' },
  ];

  const totalSavings = indents.reduce((acc, curr) => curr.lowestBid ? acc + (curr.estimatedPrice - curr.lowestBid) : acc, 0);
  const totalEstimated = indents.reduce((acc, curr) => acc + curr.estimatedPrice, 0);
  const avgReduction = totalEstimated > 0 ? (totalSavings / totalEstimated) * 100 : 0;

  const savingsData = indents.slice(-6).map(i => ({
    name: i.requestId,
    Reserve: i.estimatedPrice,
    Final: i.lowestBid || i.estimatedPrice
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
          <TrendingDown className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Rate Reduction</p>
          <p className="text-3xl font-black text-green-600">{avgReduction.toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
          <IndianRupee className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Value Analyzed</p>
          <p className="text-3xl font-black text-slate-900">₹{(totalEstimated / 100000).toFixed(1)}L</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
          <BarChart3 className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Procurement Volume</p>
          <p className="text-3xl font-black text-indigo-600">{indents.length} Units</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
          <h3 className="text-sm font-black text-slate-900 uppercase mb-8 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-indigo-500" />
            Open vs Closed Status
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
          <h3 className="text-sm font-black text-slate-900 uppercase mb-8 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-green-500" />
            Reduction Trends (Recent)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={savingsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Bar dataKey="Reserve" fill="#e2e8f0" barSize={20} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Final" fill="#1e40af" barSize={20} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendsView;
