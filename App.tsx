
import  { useState, useEffect, useMemo } from 'react';
import { UserRole, BidStatus, Indent, Bid, ViewMode } from './types';
import { MOCK_VENDORS, TOP_NAV_ITEMS } from './constants';
import { ProcurementService } from './services';
import { AuthProvider, useAuth } from './components/AuthContext';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import WorkflowBoard from './components/WorkflowBoard';
import WorkflowList from './components/WorkflowList';
import CustomerDashboard from './components/CustomerDashboard';
import VendorPortal from './components/VendorPortal';
import IndentForm from './components/IndentForm';
import BidHistoryModal from './components/BidHistoryModal';
import TrendsView from './components/TrendsView';
import ApiManagement from './components/ApiManagement';
import { Calendar, Download, Plus, LayoutGrid, List, Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  const [currentUser, setCurrentUser] = useState<{ role: UserRole; id: string; name: string }>({
    role: UserRole.CUSTOMER,
    id: 'C1',
    name: 'ABBL Admin'
  });

  const [indents, setIndents] = useState<Indent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bids, setBids] = useState<Bid[]>([]);
  const [activeNav, setActiveNav] = useState<string>('WORKFLOW');
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'CLOSED' | 'AWARDED'>('ACTIVE');
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndentForHistory, setSelectedIndentForHistory] = useState<Indent | null>(null);
  const [showIndentForm, setShowIndentForm] = useState(false);

  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Update currentUser based on logged-in user
  useEffect(() => {
    if (user) {
      setCurrentUser({
        role: user.userType === 'Customer' ? UserRole.CUSTOMER : UserRole.VENDOR,
        id: user.userId,
        name: user.emailId.split('@')[0]
      });
    }
  }, [user]);

  // Show login page if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Connect to the Firebase/Python data stream
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = ProcurementService.subscribeToIndents((data) => {
      setIndents(data);
      setIsLoading(false);
    });

    // Initial fetch for bids to populate active context
    const fetchBids = async () => {
      const allBids: Bid[] = [];
      const data = await ProcurementService.getIndents();
      for (const indent of data) {
        const indentBids = await ProcurementService.getBids(indent.id);
        allBids.push(...indentBids);
      }
      setBids(allBids);
    };
    fetchBids();

    return () => unsubscribe();
  }, []);

  // Simulator for competitive bids (Now integrated with the service layer)
  useEffect(() => {
    if (activeTab !== 'ACTIVE') return;

    const interval = setInterval(async () => {
      const liveIndents = indents.filter(i =>
        i.status === BidStatus.IN_PROGRESS || i.status === BidStatus.BID_INVITED || i.status === BidStatus.RE_BID
      );
      if (liveIndents.length > 0 && Math.random() > 0.7) {
        const indent = liveIndents[Math.floor(Math.random() * liveIndents.length)];
        const otherVendors = MOCK_VENDORS.filter(v => v.id !== currentUser.id);
        const vendor = otherVendors[Math.floor(Math.random() * otherVendors.length)];

        const newBid: Bid = {
          id: `B${Date.now()}`,
          indentId: indent.id,
          vendorId: vendor.id,
          vendorName: vendor.name,
          amount: Math.floor(indent.estimatedPrice * 0.75 + Math.random() * (indent.estimatedPrice * 0.25)),
          timestamp: new Date().toLocaleTimeString(),
        };

        await ProcurementService.submitBid(newBid);
        setBids(prev => [...prev, newBid]);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [indents, currentUser.id, activeTab]);

  const handleBidSubmit = async (indentId: string, amount: number) => {
    const newBid: Bid = {
      id: `B${Date.now()}`,
      indentId: indentId,
      vendorId: currentUser.id,
      vendorName: currentUser.name,
      amount: amount,
      timestamp: new Date().toLocaleTimeString(),
    };

    await ProcurementService.submitBid(newBid);
    setBids(prev => [...prev, newBid]);
  };

  const filteredData = useMemo(() => {
    let base = indents;

    if (currentUser.role === UserRole.VENDOR) {
      base = base.filter(i => {
        const hasMyBid = bids.some(b => b.indentId === i.id && b.vendorId === currentUser.id);
        const isMarketplace = (i.status === BidStatus.BID_INVITED || i.status === BidStatus.IN_PROGRESS || i.status === BidStatus.RE_BID);
        return hasMyBid || isMarketplace;
      });
    }

    if (activeTab === 'ACTIVE') {
      base = base.filter(i => i.status === BidStatus.BID_INVITED || i.status === BidStatus.IN_PROGRESS || i.status === BidStatus.RE_BID);
    } else if (activeTab === 'CLOSED') {
      base = base.filter(i => i.status === BidStatus.BID_CLOSED);
    } else if (activeTab === 'AWARDED') {
      base = base.filter(i => i.status === BidStatus.BID_AWARDED);
      base = base.filter(i => {
        const pDate = i.placementDate.split('T')[0];
        return pDate >= dateRange.start && pDate <= dateRange.end;
      });
    }

    const q = searchQuery.toLowerCase();
    return base.filter(i =>
      i.requestId.toLowerCase().includes(q) ||
      i.lane.source.toLowerCase().includes(q) ||
      i.lane.destination.toLowerCase().includes(q) ||
      (i.vendorName || '').toLowerCase().includes(q) ||
      (i.lowestBidVendorName || '').toLowerCase().includes(q) ||
      i.vehicleType.toLowerCase().includes(q)
    );
  }, [indents, bids, activeTab, currentUser.id, currentUser.role, searchQuery, dateRange]);

  const handleExport = () => {
    if (filteredData.length === 0) return;
    const csvData = filteredData.map(i => ({
      ID: i.requestId,
      Date: new Date(i.placementDate).toLocaleDateString(),
      Lane: `${i.lane.source} - ${i.lane.destination}`,
      Vehicle: i.vehicleType,
      Reserve: i.estimatedPrice,
      Lowest: i.lowestBid,
      Vendor: i.lowestBidVendorName,
      Savings: i.estimatedPrice - (i.lowestBid || 0)
    }));
    const csvContent = "data:text/csv;charset=utf-8,"
      + Object.keys(csvData[0]).join(",") + "\n"
      + csvData.map(row => Object.values(row).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TVS_Awards_${dateRange.start}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRoleSwitch = (role: UserRole) => {
    setCurrentUser({
      role,
      id: role === UserRole.VENDOR ? 'V1' : 'C1',
      name: role === UserRole.VENDOR ? 'Safe Logistics India' : user?.emailId.split('@')[0] || 'ABBL Admin'
    });
    setShowIndentForm(false);
    setSelectedIndentForHistory(null);
  };

  const renderWorkflowTabs = () => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex bg-white border border-gray-200 p-1 rounded-2xl shadow-sm self-start">
        <button onClick={() => setActiveTab('ACTIVE')} className={`px-6 py-2 text-[11px] font-black rounded-xl transition-all uppercase tracking-widest ${activeTab === 'ACTIVE' ? 'bg-[#1e40af] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>Active Bids</button>
        <button onClick={() => setActiveTab('CLOSED')} className={`px-6 py-2 text-[11px] font-black rounded-xl transition-all uppercase tracking-widest ${activeTab === 'CLOSED' ? 'bg-[#1e40af] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>Closed</button>
        <button onClick={() => setActiveTab('AWARDED')} className={`px-6 py-2 text-[11px] font-black rounded-xl transition-all uppercase tracking-widest ${activeTab === 'AWARDED' ? 'bg-[#1e40af] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>Awarded</button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {activeTab === 'AWARDED' && (
          <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-xl shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <input type="date" className="text-[10px] font-black outline-none text-gray-900" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
            <span className="text-gray-300 font-bold text-[10px]">TO</span>
            <input type="date" className="text-[10px] font-black outline-none text-gray-900" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
          </div>
        )}

        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl border border-gray-200">
          <button onClick={() => setViewMode('board')} className={`flex items-center gap-2 px-4 py-1.5 text-[10px] font-black rounded-lg transition-all uppercase tracking-tight ${viewMode === 'board' ? 'bg-white text-[#1e40af] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><LayoutGrid className="w-3.5 h-3.5" />Grid</button>
          <button onClick={() => setViewMode('list')} className={`flex items-center gap-2 px-4 py-1.5 text-[10px] font-black rounded-lg transition-all uppercase tracking-tight ${viewMode === 'list' ? 'bg-white text-[#1e40af] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><List className="w-3.5 h-3.5" />List</button>
        </div>

        {activeTab === 'AWARDED' && (
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-[10px] font-black rounded-xl hover:bg-green-700 shadow-lg transition-all uppercase tracking-widest"><Download className="w-3.5 h-3.5" />Export</button>
        )}

        {currentUser.role === UserRole.CUSTOMER && activeTab === 'ACTIVE' && (
          <button onClick={() => setShowIndentForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-[10px] font-black rounded-xl hover:bg-blue-700 shadow-lg transition-all uppercase tracking-widest"><Plus className="w-3.5 h-3.5" />New Indent</button>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing with Firebase Cluster...</p>
        </div>
      );
    }

    if (showIndentForm) {
      return (
        <IndentForm
          onSave={async (newIndent) => {
            await ProcurementService.createIndent(newIndent);
            setShowIndentForm(false);
          }}
          onCancel={() => setShowIndentForm(false)}
          history={indents}
          onGoToApi={() => {
            setShowIndentForm(false);
            setActiveNav('API & INTEGRATION');
          }}
        />
      );
    }

    if (activeNav === 'TRENDS') return <TrendsView indents={indents} />;
    if (activeNav === 'API & INTEGRATION') return <ApiManagement />;

    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        {currentUser.role === UserRole.CUSTOMER && <CustomerDashboard indents={indents} viewMode={viewMode} onViewModeChange={setViewMode} />}
        {currentUser.role === UserRole.VENDOR && <VendorPortal indents={indents} bids={bids} vendorId={currentUser.id} />}

        <div className="space-y-2">
          {renderWorkflowTabs()}
          {viewMode === 'board' ? (
            <WorkflowBoard indents={filteredData} onCardClick={(indent) => setSelectedIndentForHistory(indent)} onAddIndent={() => setShowIndentForm(true)} currentUser={currentUser} onBidSubmit={handleBidSubmit} />
          ) : (
            <WorkflowList indents={filteredData} onCardClick={(indent) => setSelectedIndentForHistory(indent)} isVendorView={currentUser.role === UserRole.VENDOR} vendorId={currentUser.id} vendorName={currentUser.name} onBidSubmit={handleBidSubmit} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header activeNav={activeNav} onNavChange={setActiveNav} onSearch={setSearchQuery} currentUser={currentUser} onRoleSwitch={handleRoleSwitch} />
      <main className="max-w-[1600px] mx-auto p-4 md:p-6 pb-24">
        {renderContent()}
      </main>

      {selectedIndentForHistory && (
        <BidHistoryModal
          indent={selectedIndentForHistory}
          bids={bids.filter(b => b.indentId === selectedIndentForHistory.id)}
          onClose={() => setSelectedIndentForHistory(null)}
          currentUser={currentUser}
          onBidSubmit={handleBidSubmit}
        />
      )}

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-2.5 flex items-center justify-between text-[10px] text-gray-400 font-black z-40 uppercase tracking-widest">
        <div className="flex items-center gap-4">
          <span>TVS Supply Chain Solutions © 2024 PYTHON-FIREBASE STACK</span>
          <div className="h-3 w-px bg-gray-200"></div>
          <span className="text-gray-300">FastAPI Cloud Instance</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 text-blue-600 font-black">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
            Real-time DB Socket: Connected
          </span>
          <span className="text-gray-300">v6.0.0-enterprise</span>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
