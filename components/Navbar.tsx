
import React from 'react';
import { UserRole } from '../types';

interface NavbarProps {
  role: UserRole;
  onLogout: () => void;
  onNavigateHome: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ role, onLogout, onNavigateHome }) => {
  return (
    <nav className="bg-[#020617] border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div 
        className="flex items-center gap-2 cursor-pointer group"
        onClick={onNavigateHome}
      >
        <div className="w-10 h-10 bg-[#10b981] rounded-lg flex items-center justify-center transition-all group-hover:bg-[#34d399] group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="transition-all group-hover:brightness-125">
          <h1 className="text-2xl font-black tracking-tighter text-white">GARF</h1>
          <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase -mt-1 group-hover:text-emerald-400 transition-colors">GAME.TURF</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <p className="text-xs font-bold text-slate-500 uppercase">Status</p>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full animate-pulse ${role === 'owner' ? 'bg-blue-400' : 'bg-[#10b981]'}`}></div>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
              {role === 'owner' ? 'OWNER ACCESS' : 'CUSTOMER ACCESS'}
            </p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="bg-slate-800 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 border border-transparent text-white text-xs font-bold px-4 py-2 rounded-lg transition-all"
        >
          LOG OUT
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
