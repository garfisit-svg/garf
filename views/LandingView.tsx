
import React from 'react';
import { UserRole } from '../types';
import { GamepadIcon, TrophyIcon } from '../components/Icons';

interface LandingViewProps {
  onStartAuth: (role: UserRole) => void;
  onBrowseGuest: () => void;
}

const LandingView: React.FC<LandingViewProps> = ({ onStartAuth, onBrowseGuest }) => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[120px]"></div>
      </div>

      <div className="z-10 text-center max-w-4xl">
        <div className="flex items-center justify-center gap-4 mb-6">
          <GamepadIcon className="w-10 h-10 text-cyan-400" />
          <h1 className="text-7xl font-black tracking-tighter text-white flex items-center gap-2">
            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">GARF</span>
          </h1>
          <TrophyIcon className="w-10 h-10 text-emerald-400" />
        </div>

        <h2 className="text-4xl font-extrabold text-white mb-4">Book Gaming Cafes & Sports Turfs Near You</h2>
        <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
          Play, compete, and have fun at the best gaming cafes and sports turfs in your area.
          Instant booking, flexible slots, and competitive prices.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* User Card */}
          <div className="bg-[#0b1120] border border-slate-800 p-10 rounded-[32px] flex flex-col items-center transition-all hover:scale-[1.02] hover:border-cyan-500/50 group">
            <h3 className="text-4xl font-black text-white mb-4">User</h3>
            <p className="text-slate-400 mb-8 max-w-[200px]">Browse and book gaming cafes & turfs near you</p>
            <button 
              onClick={() => onStartAuth('user')}
              className="w-full py-4 bg-[#06b6d4] hover:bg-[#0891b2] text-[#020617] font-black rounded-2xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
            >
              Continue as User
            </button>
          </div>

          {/* Owner Card */}
          <div className="bg-[#0b1120] border border-slate-800 p-10 rounded-[32px] flex flex-col items-center transition-all hover:scale-[1.02] hover:border-emerald-500/50 group">
            <h3 className="text-4xl font-black text-white mb-4">Owner</h3>
            <p className="text-slate-400 mb-8 max-w-[200px]">Manage your turf, slots, bookings & payments</p>
            <button 
              onClick={() => onStartAuth('owner')}
              className="w-full py-4 bg-[#10b981] hover:bg-[#059669] text-[#020617] font-black rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
            >
              Continue as Owner
            </button>
          </div>
        </div>

        <button 
          onClick={onBrowseGuest}
          className="text-slate-300 font-bold px-8 py-3 rounded-full border border-slate-700 hover:bg-slate-800 transition-all"
        >
          Browse Without Login
        </button>
      </div>
    </div>
  );
};

export default LandingView;
