
import React, { useState, useRef, useEffect } from 'react';
import { Search, Download, UserCircle, ChevronDown, Check, LogOut } from 'lucide-react';
import { TOP_NAV_ITEMS } from '../constants';
import { UserRole } from '../types';
import { useAuth } from './AuthContext';

interface HeaderProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
  onSearch: (query: string) => void;
  currentUser: { role: UserRole; name: string };
  onRoleSwitch: (role: UserRole) => void;
}

const Header: React.FC<HeaderProps> = ({ activeNav, onNavChange, onSearch, currentUser, onRoleSwitch }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    onRoleSwitch(role);
    setIsUserMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  // Display logged-in user's name or fallback to currentUser
  const displayName = user?.emailId.split('@')[0] || currentUser.name;
  const displayRole = user?.userType || currentUser.role;

  return (
    <div className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Logo & Nav */}
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1e40af] rounded-lg flex items-center justify-center text-white">
              <span className="font-bold text-xl tracking-tighter">TV</span>
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-[#0f172a] tracking-tight leading-none uppercase">TVS PROCUREMENT</h1>
              <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-0.5">Digital Gateway</p>
            </div>
          </div>

          <nav className="flex items-center bg-[#f1f5f9] p-1 rounded-xl">
            {TOP_NAV_ITEMS.map(item => (
              <button
                key={item.name}
                onClick={() => onNavChange(item.name)}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeNav === item.name
                  ? 'bg-white text-[#1e40af] shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
                  }`}
              >
                {item.icon}
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Right: Search & Actions */}
        <div className="flex items-center gap-4">
          <div className="relative w-80 group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1e40af] transition-colors" />
            <input
              type="text"
              placeholder="Search LR, Lane, Vendor..."
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-[#f1f5f9] border-transparent rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#1e40af]/20 focus:border-[#1e40af] transition-all outline-none placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>

          <div className="h-8 w-px bg-gray-200 mx-2"></div>

          {/* User & Role Switcher */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`flex items-center gap-3 p-1 px-3 rounded-xl transition-all border ${isUserMenuOpen ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50 border-transparent'}`}
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-gray-900 leading-none capitalize">{displayName}</p>
                <p className="text-[9px] text-blue-600 font-bold mt-1 uppercase tracking-tight">{displayRole} View</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center border border-blue-200">
                <UserCircle className="w-5 h-5 text-blue-600" />
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] py-2 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 mb-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Switch Perspective</p>
                </div>
                <button
                  onClick={() => handleRoleSelect(UserRole.CUSTOMER)}
                  className={`w-full text-left px-4 py-2.5 flex items-center justify-between text-xs font-bold transition-colors ${currentUser.role === UserRole.CUSTOMER ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Customer Workspace
                  {currentUser.role === UserRole.CUSTOMER && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleRoleSelect(UserRole.VENDOR)}
                  className={`w-full text-left px-4 py-2.5 flex items-center justify-between text-xs font-bold transition-colors ${currentUser.role === UserRole.VENDOR ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Vendor Portal
                  {currentUser.role === UserRole.VENDOR && <Check className="w-3.5 h-3.5" />}
                </button>
                <div className="h-px bg-gray-100 my-2 mx-2"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout System
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
