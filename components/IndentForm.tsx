import React, { useState, useEffect } from 'react';
import { Lane, Indent, BidStatus } from '../types';
import { Save, X, MapPin, Truck, Calendar, History, Upload, FileText, Globe, Code, Download, FileSpreadsheet, Send, ShieldCheck, ExternalLink } from 'lucide-react';

interface IndentFormProps {
  onSave: (indent: Indent) => void;
  onCancel: () => void;
  history: Indent[];
  onGoToApi?: () => void;
}

const IndentForm: React.FC<IndentFormProps> = ({ onSave, onCancel, history, onGoToApi }) => {
  const [activeTab, setActiveTab] = useState<'form' | 'upload' | 'api'>('form');
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    fromCity: '',
    toCity: '',
    distance: 0,
    vehicleType: '20 FT Container',
    vehicleCapacity: '',
    product: '',
    weight: 0, // Metric Tons
    estimatedPrice: 0,
    placementDate: '',
    cutoffTime: '',
    notes: ''
  });

  // Load from history (pre-fill)
  const handleLoadHistory = (requestId: string) => {
    const past = history.find(h => h.requestId === requestId);
    if (past) {
      setFormData({
        ...formData,
        fromCity: past.lane.source,
        toCity: past.lane.destination,
        distance: past.lane.distanceKm,
        vehicleType: past.vehicleType,
        vehicleCapacity: past.vehicleCapacity || '',
        product: past.product,
        weight: past.weight,
        estimatedPrice: past.estimatedPrice,
        notes: past.notes || ''
      });
    }
  };

  // Distance API Simulation
  useEffect(() => {
    if (formData.fromCity && formData.toCity && formData.fromCity !== formData.toCity) {
      setIsCalculatingDistance(true);
      const timer = setTimeout(() => {
        const dist = (formData.fromCity.length * 10) + (formData.toCity.length * 15) + 150;
        setFormData(prev => ({ ...prev, distance: dist }));
        setIsCalculatingDistance(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [formData.fromCity, formData.toCity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newIndent: Indent = {
      id: `TR${Date.now()}`,
      requestId: `TR-TVS-${Math.floor(100000 + Math.random() * 900000)}`,
      lane: {
        id: `L${Date.now()}`,
        source: formData.fromCity,
        destination: formData.toCity,
        distanceKm: formData.distance
      },
      vehicleType: formData.vehicleType,
      vehicleCapacity: formData.vehicleCapacity,
      product: formData.product,
      weight: formData.weight,
      estimatedPrice: formData.estimatedPrice,
      placementDate: formData.placementDate ? new Date(formData.placementDate).toISOString() : new Date().toISOString(),
      cutoffTime: formData.cutoffTime ? new Date(formData.cutoffTime).toISOString() : new Date().toISOString(),
      status: BidStatus.BID_INVITED,
      bidCount: 0,
      notes: formData.notes
    };
    onSave(newIndent);
  };

  const downloadTemplate = () => {
    const headers = "FromCity,ToCity,VehicleType,Capacity,Product,WeightMT,ReservePrice,PlacementDate,CutoffDate,Notes\n";
    const blob = new Blob([headers], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'TVS_Procurement_Template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        alert("Batch upload successful! 1 indents added to queue.");
        onCancel(); // Close form after mock success
      }, 1500);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
      {/* Header with Navigation */}
      <div className="bg-[#1e40af] px-10 py-8 flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
        <div className="z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div>
            <h2 className="text-white font-black text-2xl uppercase tracking-tighter">Procurement Engine</h2>
            <p className="text-blue-100/60 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Placement Control v5.2</p>
          </div>
          <div className="hidden md:block h-10 w-px bg-white/10"></div>
          <div className="flex bg-white/10 p-1 rounded-2xl backdrop-blur-md">
            <button 
              onClick={() => setActiveTab('form')}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'form' ? 'bg-white text-blue-600 shadow-lg' : 'text-white/60 hover:text-white'}`}
            >
              <FileText className="w-3.5 h-3.5" />
              Manual Entry
            </button>
            <button 
              onClick={() => setActiveTab('upload')}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'upload' ? 'bg-white text-blue-600 shadow-lg' : 'text-white/60 hover:text-white'}`}
            >
              <Upload className="w-3.5 h-3.5" />
              Bulk Upload
            </button>
            <button 
              onClick={() => setActiveTab('api')}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'api' ? 'bg-white text-blue-600 shadow-lg' : 'text-white/60 hover:text-white'}`}
            >
              <Code className="w-3.5 h-3.5" />
              Developer API
            </button>
          </div>
        </div>
        <button onClick={onCancel} className="z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all active:scale-95">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-10 min-h-[500px]">
        {/* TAB 1: MANUAL ENTRY */}
        {activeTab === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in duration-300">
            {/* Quick Template Selection */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-[1.5rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border border-slate-100">
                  <History className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency Tools</p>
                  <p className="text-xs font-bold text-slate-700">Load from past successful indent</p>
                </div>
              </div>
              <select 
                onChange={(e) => handleLoadHistory(e.target.value)}
                className="w-full sm:w-auto min-w-[300px] bg-white border border-slate-200 rounded-xl px-4 py-3 text-[11px] font-black text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm uppercase tracking-tight"
              >
                <option value="">Select an active template...</option>
                {history.map(h => (
                  <option key={h.requestId} value={h.requestId}>{h.requestId} | {h.lane.source} → {h.lane.destination}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Left Column: Route & Vehicle */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
                    <Globe className="w-4 h-4" />
                    Route Logistics
                  </h3>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Source City</label>
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                        <input 
                          type="text"
                          required
                          placeholder="Origin city"
                          className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-black text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all uppercase placeholder:text-slate-300"
                          value={formData.fromCity}
                          onChange={(e) => setFormData({...formData, fromCity: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Destination</label>
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-red-500 transition-colors" />
                        <input 
                          type="text"
                          required
                          placeholder="Terminal city"
                          className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-black text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all uppercase placeholder:text-slate-300"
                          value={formData.toCity}
                          onChange={(e) => setFormData({...formData, toCity: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 bg-blue-50/40 border border-blue-100/50 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${isCalculatingDistance ? 'bg-orange-400 animate-pulse' : 'bg-blue-600'}`}></div>
                      <p className="text-[9px] font-black text-blue-800 uppercase tracking-widest">
                        {isCalculatingDistance ? 'Analyzing Map APIs...' : 'Verified Route Distance'}
                      </p>
                    </div>
                    <p className="text-xs font-black text-blue-600">{formData.distance} KM <span className="text-[8px] text-blue-300 ml-1">EST.</span></p>
                  </div>
                </div>

                <div>
                  <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
                    <Truck className="w-4 h-4" />
                    Vehicle Config
                  </h3>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Vehicle Type</label>
                      <select 
                        className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-black text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all uppercase"
                        value={formData.vehicleType}
                        onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                      >
                        <option>20 FT Container</option>
                        <option>32 FT SXL</option>
                        <option>32 FT MXL</option>
                        <option>Tata Ace</option>
                        <option>Bolero</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Capacity (MT)</label>
                      <input 
                        type="text"
                        placeholder="e.g. 15 MT"
                        className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-black text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all uppercase placeholder:text-slate-300"
                        value={formData.vehicleCapacity}
                        onChange={(e) => setFormData({...formData, vehicleCapacity: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Consignment & Bidding */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
                    <FileText className="w-4 h-4" />
                    Consignment Data
                  </h3>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Product Line</label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. Retail Goods"
                        className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-black text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all uppercase"
                        value={formData.product}
                        onChange={(e) => setFormData({...formData, product: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Estimated Weight (MT)</label>
                      <input 
                        type="number"
                        required
                        step="0.1"
                        placeholder="0.0"
                        className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-black text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all"
                        value={formData.weight || ''}
                        onChange={(e) => setFormData({...formData, weight: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
                    <Calendar className="w-4 h-4" />
                    Timeline & Reserve
                  </h3>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Placement Date</label>
                      <input 
                        type="datetime-local"
                        required
                        className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all uppercase"
                        value={formData.placementDate}
                        onChange={(e) => setFormData({...formData, placementDate: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Bidding Close</label>
                      <input 
                        type="datetime-local"
                        required
                        className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all uppercase"
                        value={formData.cutoffTime}
                        onChange={(e) => setFormData({...formData, cutoffTime: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="mt-5 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Reserve Price (₹)</label>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-green-600 font-black text-xs">₹</div>
                      <input 
                        type="number"
                        required
                        placeholder="Expected target price"
                        className="w-full pl-10 pr-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-black text-green-700 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-50/50 transition-all placeholder:text-slate-300"
                        value={formData.estimatedPrice || ''}
                        onChange={(e) => setFormData({...formData, estimatedPrice: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-slate-100 flex items-center justify-end gap-6">
              <button 
                type="button" 
                onClick={onCancel}
                className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
              >
                Cancel Draft
              </button>
              <button 
                type="submit" 
                className="px-12 py-4 bg-[#1e40af] text-white text-[11px] font-black rounded-[1.25rem] hover:bg-blue-800 shadow-xl shadow-blue-900/20 transition-all active:scale-95 uppercase tracking-widest flex items-center gap-3"
              >
                <Send className="w-4 h-4" />
                Broadcast to Vendors
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: BULK UPLOAD */}
        {activeTab === 'upload' && (
          <div className="max-w-2xl mx-auto py-12 space-y-10 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                <FileSpreadsheet className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Bulk Indent Placement</h3>
              <p className="text-sm font-medium text-slate-500">Upload multiple lane requests using our standardized CSV template.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button 
                onClick={downloadTemplate}
                className="group p-8 bg-white border-2 border-dashed border-slate-200 rounded-[2rem] hover:border-blue-400 hover:bg-blue-50/30 transition-all flex flex-col items-center gap-4"
              >
                <div className="w-12 h-12 bg-slate-50 group-hover:bg-blue-100 rounded-2xl flex items-center justify-center transition-colors">
                  <Download className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Get Template</p>
                  <p className="text-[9px] font-bold text-slate-400 mt-1">Download CSV structure</p>
                </div>
              </button>

              <label className="group p-8 bg-white border-2 border-dashed border-slate-200 rounded-[2rem] hover:border-green-400 hover:bg-green-50/30 transition-all flex flex-col items-center gap-4 cursor-pointer relative">
                {isUploading && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-[2rem] flex items-center justify-center z-10">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[10px] font-black text-green-600 uppercase">Processing File...</p>
                    </div>
                  </div>
                )}
                <div className="w-12 h-12 bg-slate-50 group-hover:bg-green-100 rounded-2xl flex items-center justify-center transition-colors">
                  <Upload className="w-6 h-6 text-slate-400 group-hover:text-green-600" />
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Upload File</p>
                  <p className="text-[9px] font-bold text-slate-400 mt-1">Click or drag CSV here</p>
                </div>
                <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} disabled={isUploading} />
              </label>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-start gap-4">
              <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-wider">Validation Engine Active</p>
                <p className="text-[10px] font-medium text-slate-500 leading-relaxed">Our system automatically validates city names, vehicle codes, and reserve price ranges against your historical procurement norms to ensure data integrity.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DEVELOPER API */}
        {activeTab === 'api' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex items-start gap-4 p-8 bg-blue-50/50 border border-blue-100 rounded-[2rem]">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <Code className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest">Automation Integration</p>
                <p className="text-xs font-medium text-blue-700/70 mt-1 max-w-xl leading-relaxed">External ERP or TMS systems can push indents directly into the TVS Procurement Engine via secure REST endpoints.</p>
                <button 
                  onClick={onGoToApi}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-[10px] font-black rounded-lg hover:bg-blue-700 transition-all uppercase tracking-widest"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Go to API Console
                </button>
              </div>
            </div>
            
            <div className="bg-slate-900 rounded-[2rem] p-10 overflow-x-auto shadow-2xl relative">
              <div className="absolute top-6 right-8 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
              <pre className="text-blue-300 text-[11px] font-mono leading-loose">
{`// SECURE POST REQUEST TO TVS GATEWAY
POST /api/v1/trips/push
Headers: { "X-API-KEY": "••••••••••••••••" }

{
  "request_id": "TR-SAP-9920",
  "lane": {
    "source": "Mumbai",
    "destination": "Bangalore"
  },
  "vehicle": {
    "type": "32 FT SXL",
    "capacity_mt": 15
  },
  "consignment": {
    "weight_mt": 12.5,
    "product": "Industrial Goods"
  },
  "timelines": {
    "placement": "2025-06-15T09:00:00Z",
    "cutoff": "2025-06-14T18:00:00Z"
  }
}`}
              </pre>
            </div>
            
            <div className="flex justify-center">
              <button 
                onClick={() => setActiveTab('form')}
                className="px-8 py-3 bg-slate-100 text-slate-500 text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Return to Manual Input
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndentForm;