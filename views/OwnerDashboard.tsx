
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { MOCK_BOOKINGS } from '../constants';
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

interface OwnerDashboardProps {
  hubs: Hub[];
  onLogout: () => void;
  onAddHub: () => void;
  onEditHub: (hub: Hub) => void;
  onToggleSoldOut: (hubId: string) => void;
  onNavigateHome: () => void;
}

const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ hubs, onLogout, onAddHub, onEditHub, onToggleSoldOut, onNavigateHome }) => {
  const [activeTab, setActiveTab] = useState<'management' | 'arrivals' | 'analytics'>('management');
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);

  const handleAction = (id: string, status: 'confirmed' | 'expired') => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Navbar role="owner" onLogout={onLogout} onNavigateHome={onNavigateHome} />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black tracking-tighter uppercase mb-1">Owner Control Room</h1>
            <p className="text-slate-500 text-sm font-black uppercase tracking-[0.2em]">Global Hub Monitoring Active</p>
          </div>
          <button 
            onClick={onAddHub}
            className="bg-[#10b981] hover:bg-emerald-400 text-[#020617] font-black px-10 py-4 rounded-2xl transition-all shadow-[0_8px_32px_rgba(16,185,129,0.2)]"
          >
            Add New Venue
          </button>
        </header>

        <div className="flex justify-start mb-12">
          <div className="bg-[#0b1120] border border-slate-800 rounded-[20px] p-1.5 flex gap-1">
            {[
              { id: 'management', label: 'Management' },
              { id: 'arrivals', label: 'Live Arrivals' },
              { id: 'analytics', label: 'Analytics' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-8 py-3.5 rounded-[15px] font-black text-[11px] uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-[#10b981] text-[#020617]' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'arrivals' && (
          <div className="grid gap-6">
            {bookings.length === 0 ? (
              <div className="text-center py-20 bg-[#0b1120] border border-dashed border-slate-800 rounded-[40px]">
                <p className="text-slate-600 font-black uppercase tracking-widest">No Incoming Traffic Detected</p>
              </div>
            ) : (
              bookings.map(b => (
                <div key={b.id} className="bg-[#0b1120] border border-slate-800 rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-8 transition-all hover:border-slate-600">
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl ${b.paymentMethod === 'cash' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                      {b.paymentMethod[0].toUpperCase()}
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
                          <button onClick={() => handleAction(b.id, 'confirmed')} className="bg-[#10b981] hover:bg-emerald-400 text-[#020617] px-6 py-3 rounded-xl font-black text-xs uppercase transition-all">Confirm</button>
                          <button onClick={() => handleAction(b.id, 'expired')} className="bg-red-900/20 hover:bg-red-900/40 text-red-500 px-6 py-3 rounded-xl font-black text-xs uppercase transition-all">Release</button>
                        </>
                      ) : (
                        <div className={`px-6 py-3 rounded-xl font-black text-xs uppercase ${b.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
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
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-[#0b1120] border border-slate-800 rounded-[40px] p-10">
               <h3 className="text-xl font-black uppercase mb-8 tracking-tighter">Performance Matrix</h3>
               <div className="mt-8 grid grid-cols-4 gap-4 text-center">
                  <div><p className="text-2xl font-black">₹{hubs.length * 15}k</p><p className="text-[10px] text-slate-500 uppercase font-bold">Rev Forecast</p></div>
                  <div><p className="text-2xl font-black text-emerald-400">+{hubs.length}%</p><p className="text-[10px] text-slate-500 uppercase font-bold">Growth</p></div>
                  <div><p className="text-2xl font-black">{hubs.length * 12}</p><p className="text-[10px] text-slate-500 uppercase font-bold">Bookings</p></div>
                  <div><p className="text-2xl font-black">4.9</p><p className="text-[10px] text-slate-500 uppercase font-bold">Avg Rating</p></div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'management' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {hubs.length === 0 ? (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800 rounded-[40px]">
                <p className="text-slate-600 font-black uppercase tracking-widest">No Venues Registered Yet</p>
                <button onClick={onAddHub} className="mt-4 text-[#10b981] font-black uppercase tracking-widest hover:underline">+ Launch First Venue</button>
              </div>
            ) : (
              hubs.map(hub => (
                <div key={hub.id} className="bg-[#0b1120] border border-slate-800 rounded-[40px] overflow-hidden group transition-all hover:border-slate-600">
                  <div className="relative h-64 w-full">
                    <img src={hub.image} className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${hub.isSoldOut ? 'grayscale contrast-125' : ''}`} alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] to-transparent opacity-80"></div>
                    {hub.isSoldOut && (
                       <div className="absolute top-8 right-8 bg-red-600 text-white font-black px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest animate-pulse">
                         Sold Out
                       </div>
                    )}
                    <div className="absolute bottom-8 left-8">
                      <h4 className="text-4xl font-black text-white tracking-tighter mb-1 uppercase">{hub.name}</h4>
                      <p className="text-slate-400 font-black text-sm tracking-widest uppercase">{hub.location}</p>
                    </div>
                  </div>
                  <div className="p-8 flex gap-4">
                    <button 
                      onClick={() => onToggleSoldOut(hub.id)}
                      className={`flex-1 py-5 border font-black rounded-2xl uppercase text-[11px] tracking-widest transition-all ${
                        hub.isSoldOut 
                          ? 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20' 
                          : 'bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981] hover:bg-[#10b981]/20'
                      }`}
                    >
                      {hub.isSoldOut ? 'Sold Out' : 'Active'}
                    </button>
                    <button 
                      onClick={() => onEditHub(hub)}
                      className="flex-1 py-5 bg-slate-900 border border-slate-800 text-white font-black rounded-2xl uppercase text-[11px] tracking-widest hover:bg-slate-800 transition-all"
                    >
                      Edit Hub
                    </button>
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
