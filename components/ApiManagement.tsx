import React, { useState } from 'react';
import { Key, Shield, Code, Copy, Trash2, Eye, EyeOff, Plus, CheckCircle2, Terminal, Info, Globe, ShieldAlert } from 'lucide-react';
import { ApiKey } from '../types';

const ApiManagement: React.FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>([
    { id: '1', name: 'ERP Production Connector', key: 'tv_live_4a2f8b9e1c0d5f', createdAt: '2024-03-20', status: 'Active' },
    { id: '2', name: 'Warehouse Testing', key: 'tv_test_9z8y7x6w5v4u3t', createdAt: '2024-04-12', status: 'Revoked' },
  ]);
  const [revealIds, setRevealIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const generateKey = () => {
    if (!newKeyName.trim()) return;
    const newKey: ApiKey = {
      id: Math.random().toString(36).substr(2, 9),
      name: newKeyName,
      key: `tv_live_${Math.random().toString(36).substr(2, 14)}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'Active'
    };
    setKeys([newKey, ...keys]);
    setNewKeyName('');
    setShowAddForm(false);
  };

  const toggleReveal = (id: string) => {
    const next = new Set(revealIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setRevealIds(next);
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const revokeKey = (id: string) => {
    setKeys(keys.map(k => k.id === id ? { ...k, status: 'Revoked' as const } : k));
  };

  const deleteKey = (id: string) => {
    setKeys(keys.filter(k => k.id !== id));
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">API Management Suite</h2>
          </div>
          <p className="text-slate-500 text-sm font-medium">Manage secure authentication keys and technical integration endpoints for GreenXpress.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="px-6 py-3 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-xl shadow-indigo-900/10 active:scale-95 uppercase tracking-widest"
        >
          <Plus className="w-4 h-4" />
          Generate New Key
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Keys & Management */}
        <div className="lg:col-span-2 space-y-8">
          {/* Add Form Overlay */}
          {showAddForm && (
            <div className="bg-white border-2 border-indigo-100 rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-600" />
                Auth Key Configuration
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Key Descriptor (Internal Name)</label>
                  <input 
                    type="text"
                    autoFocus
                    placeholder="e.g. SAP Integration Layer"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={generateKey}
                    disabled={!newKeyName.trim()}
                    className="flex-1 px-6 py-4 bg-indigo-600 text-white text-[10px] font-black rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all uppercase tracking-widest"
                  >
                    Confirm & Provision
                  </button>
                  <button 
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-4 bg-slate-100 text-slate-500 text-[10px] font-black rounded-xl hover:bg-slate-200 transition-all uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Keys Table */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-10 py-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Auth Tokens</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase">Live Security Gateway</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/30 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-10 py-5">Name & ID</th>
                    <th className="px-6 py-5">Key Value</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-10 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {keys.map((k) => (
                    <tr key={k.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-6">
                        <p className="text-xs font-black text-slate-900">{k.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">Created on {k.createdAt}</p>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          <code className="px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] font-mono font-bold text-slate-600">
                            {revealIds.has(k.id) ? k.key : '••••••••••••••••••••••••'}
                          </code>
                          <button 
                            onClick={() => toggleReveal(k.id)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                          >
                            {revealIds.has(k.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider border ${
                          k.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'
                        }`}>
                          {k.status}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => copyToClipboard(k.id, k.key)}
                            className={`p-2 rounded-xl transition-all ${copiedId === k.id ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                          >
                            {copiedId === k.id ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                          {k.status === 'Active' ? (
                            <button 
                              onClick={() => revokeKey(k.id)}
                              className="p-2 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                              title="Revoke Access"
                            >
                              <ShieldAlert className="w-4 h-4" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => deleteKey(k.id)}
                              className="p-2 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition-all"
                              title="Delete Permanently"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Endpoint Documentation */}
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-200">Production REST Endpoints</h3>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-emerald-500 text-[10px] font-black rounded-lg text-white">POST</span>
                    <code className="text-indigo-300 font-mono text-xs">https://api.greenxpress.com/v1/trips/push</code>
                  </div>
                  <p className="text-xs text-slate-400 font-medium ml-1">Main endpoint for ingesting bulk lane requirements from external TMS systems.</p>
                </div>

                <div className="h-px bg-slate-800"></div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Required Headers</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                      <p className="text-[9px] font-bold text-slate-500 uppercase">Content-Type</p>
                      <p className="text-xs font-mono text-slate-300 mt-1">application/json</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                      <p className="text-[9px] font-bold text-slate-500 uppercase">X-API-KEY</p>
                      <p className="text-xs font-mono text-slate-300 mt-1">{"<YOUR_TOKEN_HERE>"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Unified JSON Schema */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-indigo-600" />
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Unified Request Schema</h3>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-6 font-mono text-[10px] leading-relaxed text-slate-600 overflow-x-auto border border-slate-200">
              <pre>
{`{
  "request_id": "string",
  "lane": {
    "source": "string",
    "destination": "string"
  },
  "vehicle": {
    "type": "string",
    "capacity_mt": number
  },
  "consignment": {
    "weight_mt": number,
    "product": "string"
  },
  "timelines": {
    "placement": "ISO8601",
    "cutoff": "ISO8601"
  },
  "commercials": {
    "reserve_price": number
  }
}`}
              </pre>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                  The <span className="font-bold text-slate-900">request_id</span> must be unique to your system to prevent duplicate ingestion.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                  City names are normalized against our <span className="font-bold text-slate-900">GeoNode Cluster</span>. Exact spelling is recommended.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-8 space-y-4">
            <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Developer Support</h4>
            <p className="text-[10px] font-medium text-indigo-700/80 leading-relaxed">
              Need help with integration? Our technical team is available 24/7 via the priority developer channel.
            </p>
            <button className="w-full py-3 bg-white border border-indigo-200 text-indigo-600 text-[10px] font-black rounded-xl hover:bg-indigo-500 hover:text-white transition-all uppercase tracking-widest shadow-sm">
              View SDK Documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiManagement;