import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Booking, Hub } from '../types';

const ArrivalTimer: React.FC<{ createdAt: number }> = ({ createdAt }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculate = () => {
      const fifteenMins = 15 * 60 * 1000;
      const elapsed = Date.now() - createdAt;
      const remaining = Math.max(0, fifteenMins - elapsed);
      setTimeLeft(remaining);
    };
    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const mins = Math.floor(timeLeft / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);

  return (
    <div className={`text-xl font-black ${timeLeft < 5 * 60 * 1000 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>
      {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
    </div>
  );
};

const PerformanceGraph: React.FC<{ hasData: boolean }> = ({ hasData }) => {
  const pathData = hasData 
    ? "M0,250 Q100,200 200,220 T400,100 T600,150 T800,50 L800,300 L0,300 Z"
    : "M0,280 L800,280 L800,300 L0,300 Z";
  const strokeData = hasData
    ? "M0,250 Q100,200 200,220 T400,100 T600,150 T800,50"
    : "M0,280 L800,280";

  return (
    <div className="relative w-full h-[300px] mt-10">
      <svg viewBox="0 0 800 300" className="w-full h-full">
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1="0" y1={i * 100} x2="800" y2={i * 100} stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
        ))}
        <defs>
          <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={hasData ? "0.3" : "0.05"} />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={pathData} fill="url(#graphGradient)" className="transition-all duration-1000" />
        <path d={strokeData} fill="none" stroke={hasData ? "#10b981" : "#1e293b"} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={`transition-all duration-1000 ${hasData ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : ''}`} />
      </svg>
      {!hasData && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.5em]">System Dormant - No Traffic Detected</p>
        </div>
      )}
      <div className="flex justify-between mt-4 text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">
        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
      </div>
    </div>
  );
};

interface OwnerDashboardProps {
  hubs: Hub[];
  bookings: Booking[];
  onUpdateBookingStatus: (id: string, status: 'confirmed' | 'expired') => void;
  onLogout: () => void;
  onAddHub: () => void;
  onEditHub: (hub: Hub) => void;
  onDeleteHub: (hubId: string) => void;
  onToggleSoldOut: (hubId: string) => void;
  onNavigateHome: () => void;
}

const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ hubs, bookings, onUpdateBookingStatus, onLogout, onAddHub, onEditHub, onDeleteHub, onToggleSoldOut, onNavigateHome }) => {
  const [activeTab, setActiveTab] = useState<'management' | 'arrivals' | 'analytics'>('management');

  const getPaymentTheme = (method: string) => {
    switch(method) {
      case 'upi': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'cash': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Navbar role="owner" onLogout={onLogout} onNavigateHome={onNavigateHome} />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black tracking-tighter uppercase mb-1">Owner Control Room</h1>
            <p className="text-slate-500 text-sm font-black uppercase tracking-[0.2em]">Live Arena Operations Network</p>
          </div>
          <button onClick={onAddHub} className="bg-[#10b981] hover:bg-emerald-400 text-[#020617] font-black px-10 py-4 rounded-2xl transition-all shadow-[0_8px_32px_rgba(16,185,129,0.2)]">Deploy New Venue</button>
        </header>

        <div className="flex justify-start mb-12">
          <div className="bg-[#0b1120] border border-slate-800 rounded-[20px] p-1.5 flex gap-1">
            {['management', 'arrivals', 'analytics'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-8 py-3.5 rounded-[15px] font-black text-[11px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-[#10b981] text-[#020617]' : 'text-slate-500 hover:text-slate-300'}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'arrivals' && (
          <div className="grid gap-6">
            {bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 bg-[#0b1120] border border-dashed border-slate-800 rounded-[60px] text-center">
                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6 animate-pulse border border-slate-800"><svg className="w-8 h-8 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
                <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tighter">No Active Arrivals</h3>
                <p className="text-slate-600 font-bold text-xs uppercase tracking-widest mt-2">Monitoring scanner for incoming traffic...</p>
              </div>
            ) : (
              bookings.map(b => (
                <div key={b.id} className="bg-[#0b1120] border border-slate-800 rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-8 transition-all hover:border-slate-600">
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center font-black text-xl ${getPaymentTheme(b.paymentMethod)}`}>
                      {b.paymentMethod === 'upi' ? 'U' : b.paymentMethod === 'cash' ? 'C' : 'O'}
                    </div>
                    <div>
                      <h4 className="text-2xl font-black">{b.userName}</h4>
                      <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">{b.hubName} • {b.accessoryName || 'Main Area'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-12">
                    <div className="text-center">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Schedule</p>
                       <p className="text-xl font-black">{b.slotTime}</p>
                    </div>
                    {b.status === 'pending' && b.paymentMethod === 'cash' && (
                      <div className="text-center px-8 border-x border-slate-800">
                         <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Arrival Window</p>
                         <ArrivalTimer createdAt={b.createdAt} />
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      {b.status === 'pending' ? (
                        <>
                          <button onClick={() => onUpdateBookingStatus(b.id, 'confirmed')} className="bg-[#10b981] hover:bg-emerald-400 text-[#020617] px-6 py-3 rounded-xl font-black text-xs uppercase transition-all">Confirm</button>
                          <button onClick={() => onUpdateBookingStatus(b.id, 'expired')} className="bg-red-900/20 hover:bg-red-900/40 text-red-500 px-6 py-3 rounded-xl font-black text-xs uppercase transition-all">Release</button>
                        </>
                      ) : (
                        <div className={`px-6 py-3 rounded-xl border font-black text-xs uppercase ${b.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                           {b.status}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-10">
            <div className="bg-[#0b1120] border border-slate-800 rounded-[50px] p-12 shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[120px] pointer-events-none"></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-2">Real-time Performance</p>
                  <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Operations Growth</h3>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black text-white">₹{bookings.filter(b => b.status === 'confirmed').reduce((acc, curr) => acc + (parseInt(curr.slotTime.split('₹')[1]) || 0), 0)}</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confirmed Total Revenue</p>
                </div>
              </div>
              <PerformanceGraph hasData={bookings.length > 0} />
            </div>
          </div>
        )}

        {activeTab === 'management' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {hubs.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-40 bg-[#0b1120] border border-dashed border-slate-800 rounded-[60px] text-center">
                <div className="w-24 h-24 bg-[#020617] rounded-full flex items-center justify-center mb-8 border border-slate-800 transition-all"><svg className="w-10 h-10 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg></div>
                <h3 className="text-3xl font-black text-slate-500 uppercase tracking-tighter">Sector Dormant</h3>
                <p className="text-slate-600 font-bold text-sm uppercase tracking-widest mt-3 mb-8">Register your first venue to start operations</p>
                <button onClick={onAddHub} className="px-8 py-4 bg-[#10b981] text-[#020617] font-black rounded-2xl uppercase text-xs tracking-widest hover:scale-105 transition-all">+ Initialize First Arena</button>
              </div>
            ) : (
              hubs.map(hub => (
                <div key={hub.id} className="bg-[#0b1120] border border-slate-800 rounded-[40px] overflow-hidden group transition-all hover:border-slate-600">
                  <div className="relative h-64 w-full">
                    <img src={hub.images[0]} className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${hub.isSoldOut ? 'grayscale contrast-125' : ''}`} alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] to-transparent opacity-80"></div>
                    {hub.isSoldOut && <div className="absolute top-8 right-8 bg-red-600 text-white font-black px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest animate-pulse">Sold Out</div>}
                    <div className="absolute bottom-8 left-8">
                      <h4 className="text-4xl font-black text-white tracking-tighter mb-1 uppercase">{hub.name}</h4>
                      <p className="text-slate-400 font-black text-sm tracking-widest uppercase">{hub.location}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); if(confirm('Permanently decommission this venue?')) onDeleteHub(hub.id); }} className="absolute top-8 right-8 w-12 h-12 bg-red-600/20 backdrop-blur-md border border-red-500/30 rounded-2xl flex items-center justify-center text-red-500 hover:bg-red-600 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                  <div className="p-8 flex gap-4">
                    <button onClick={() => onToggleSoldOut(hub.id)} className={`flex-1 py-5 border font-black rounded-2xl uppercase text-[11px] tracking-widest transition-all ${hub.isSoldOut ? 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20' : 'bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981] hover:bg-[#10b981]/20'}`}>
                      {hub.isSoldOut ? 'Sold Out' : 'Active'}
                    </button>
                    <button onClick={() => onEditHub(hub)} className="flex-1 py-5 bg-slate-900 border border-slate-800 text-white font-black rounded-2xl uppercase text-[11px] tracking-widest hover:bg-slate-800 transition-all">Edit Hub</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default OwnerDashboard;