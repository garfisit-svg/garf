
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { MOCK_HUBS, GARF_BUZZ } from '../constants';
import { Hub } from '../types';
import { SearchIcon, StarIcon, MapPinIcon } from '../components/Icons';

interface UserDashboardProps {
  onLogout: () => void;
  onHubSelect: (hub: Hub) => void;
  onNavigateHome: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ onLogout, onHubSelect, onNavigateHome }) => {
  const [search, setSearch] = useState('');

  const filteredHubs = MOCK_HUBS.filter(hub => {
    const matchesSearch = hub.name.toLowerCase().includes(search.toLowerCase()) || 
                          hub.location.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  // Duplicate items for seamless continuous marquee
  const bestSellers = MOCK_HUBS.filter(h => h.isBestSeller || h.rating >= 4.7);
  const marqueeHubs = [...bestSellers, ...bestSellers, ...bestSellers, ...bestSellers];
  const marqueeBuzz = [...GARF_BUZZ, ...GARF_BUZZ, ...GARF_BUZZ, ...GARF_BUZZ, ...GARF_BUZZ];

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden">
      <Navbar role="user" onLogout={onLogout} onNavigateHome={onNavigateHome} />

      <main className="max-w-[1600px] mx-auto py-8">
        {/* 1. Refined Search Hero Section */}
        <section className="px-6 mb-16">
          <div className="relative w-full rounded-[60px] overflow-hidden min-h-[480px] flex flex-col items-center justify-center text-center p-12 border border-slate-800/30 shadow-2xl">
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=2000" 
                className="w-full h-full object-cover brightness-[0.1] blur-[1px]" 
                alt="" 
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617]"></div>
            </div>

            <div className="relative z-10 space-y-8 w-full max-w-4xl">
              <div className="space-y-4">
                <p className="text-[#10b981] text-xs font-black uppercase tracking-[0.5em] animate-pulse">Searching Nearby</p>
                <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.9] uppercase tracking-tighter">
                  DOMINATE THE<br />
                  <span className="bg-gradient-to-r from-[#10b981] via-emerald-400 to-cyan-500 bg-clip-text text-transparent">DIGITAL & DIRT</span>
                </h1>
                <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto">
                  Real-time bookings for elite sports turfs and next-gen gaming cafes.
                </p>
              </div>

              <div className="relative group w-full max-w-2xl mx-auto">
                <div className="absolute left-6 top-1/2 -translate-y-1/2">
                  <SearchIcon className="w-6 h-6 text-[#10b981]" />
                </div>
                <input 
                  type="text"
                  placeholder="Search city, area or hub name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#0b1120]/60 backdrop-blur-2xl border border-slate-700/50 rounded-full py-6 pl-16 pr-8 text-white focus:border-[#10b981] focus:ring-4 focus:ring-[#10b981]/10 outline-none transition-all placeholder:text-slate-500 text-lg shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2. Top Tier Marquee - Refined Continuous Movement */}
        <section className="mb-14 relative overflow-hidden group">
          <div className="px-6 flex items-center gap-3 mb-6">
            <div className="w-1.5 h-6 bg-[#10b981] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white">Top Tier Arenas</h2>
            <div className="h-px flex-1 bg-slate-800/50 ml-4"></div>
          </div>

          <div className="relative w-full overflow-hidden h-[180px]">
            {/* Edge Gradients */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#020617] to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#020617] to-transparent z-10 pointer-events-none"></div>
            
            <div className="flex gap-6 animate-marquee whitespace-nowrap py-2 hover:pause">
              {marqueeHubs.map((hub, idx) => (
                <div 
                  key={`${hub.id}-${idx}`}
                  onClick={() => onHubSelect(hub)}
                  className="flex-shrink-0 w-[300px] h-[160px] bg-[#0b1120] border border-slate-800 rounded-3xl overflow-hidden cursor-pointer group transition-all hover:border-[#10b981]/50 relative shadow-xl hover:-translate-y-1"
                >
                  <img src={hub.image} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/10 to-transparent"></div>
                  <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end">
                    <div>
                      <h4 className="text-lg font-black text-white uppercase tracking-tight truncate max-w-[170px]">{hub.name}</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{hub.location}</p>
                    </div>
                    <div className="bg-[#10b981]/10 backdrop-blur-md text-[#10b981] text-[10px] font-black px-2.5 py-1 rounded-lg border border-[#10b981]/20">
                      {hub.rating} ★
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Garf Buzz Marquee - Smaller & Reverse Continuous */}
        <section className="mb-24 relative overflow-hidden">
          <div className="px-6 flex items-center gap-3 mb-6">
            <div className="w-1.5 h-6 bg-purple-600 rounded-full shadow-[0_0_10px_rgba(147,51,234,0.5)]"></div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white">Garf Buzz</h2>
          </div>

          <div className="relative w-full h-[120px] overflow-hidden">
            {/* Edge Gradients */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#020617] to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#020617] to-transparent z-10 pointer-events-none"></div>
            
            <div className="flex gap-4 animate-marquee-reverse whitespace-nowrap py-2 hover:pause">
              {marqueeBuzz.map((buzz, idx) => (
                <div 
                  key={idx}
                  className="flex-shrink-0 w-[240px] h-[90px] p-5 rounded-2xl border border-purple-500/10 bg-purple-900/5 backdrop-blur-sm group hover:border-purple-500/40 transition-all cursor-default"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></span>
                    <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest">{buzz.tag}</p>
                  </div>
                  <h4 className="text-[11px] font-black text-white uppercase mb-1 truncate">{buzz.title}</h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight line-clamp-1">{buzz.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Browse All Section */}
        <section className="px-6 mb-24">
          <div className="flex items-center justify-between mb-10 border-b border-slate-800 pb-8">
            <div className="flex items-center gap-4">
              <div className="w-2 h-10 bg-emerald-500 rounded-full"></div>
              <h2 className="text-4xl font-black uppercase tracking-tighter text-white">Explore All Venues</h2>
            </div>
            <span className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">{filteredHubs.length} Units Online</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredHubs.map((hub) => (
              <div 
                key={hub.id}
                onClick={() => onHubSelect(hub)}
                className="bg-[#0b1120] border border-slate-800 rounded-[40px] overflow-hidden group cursor-pointer transition-all hover:border-slate-600 hover:shadow-2xl shadow-lg relative"
              >
                <div className="h-64 relative overflow-hidden">
                  <img src={hub.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                  <div className="absolute top-5 right-5">
                    <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl ${hub.type === 'TURF' ? 'bg-[#10b981] text-[#020617]' : 'bg-blue-600 text-white'}`}>
                      {hub.type}
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-2xl font-black text-white uppercase tracking-tight mb-1">{hub.name}</h4>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPinIcon className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold uppercase tracking-widest">{hub.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500 font-black bg-yellow-500/10 px-3 py-1.5 rounded-xl border border-yellow-500/10">
                      <StarIcon className="w-3.5 h-3.5" />
                      <span className="text-sm">{hub.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
                    <div>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Starting Price</p>
                      <p className="text-3xl font-black text-white">₹{hub.priceStart}</p>
                    </div>
                    <button className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:bg-[#10b981] group-hover:text-[#020617] group-hover:border-transparent transition-all shadow-inner">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .animate-marquee {
          animation: marquee 40s linear infinite;
          width: max-content;
        }

        .animate-marquee-reverse {
          animation: marquee 50s linear infinite reverse;
          width: max-content;
        }

        .hover\\:pause:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;
