
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { MOCK_HUBS } from '../constants';
import { Hub } from '../types';
import { SearchIcon, StarIcon } from '../components/Icons';

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

  // Tripling the arrays ensures enough content for a seamless infinite loop regardless of screen width
  const scrollingHubs = [...filteredHubs, ...filteredHubs, ...filteredHubs];
  
  const scrollingBuzz = [
    { title: 'WEEKEND PLANS', content: 'Book group sessions for elite Saturday/Sunday matches.', color: 'border-blue-500/40' },
    { title: 'GO DIGITAL', content: 'Pay online for instant check-ins and priority queue access.', color: 'border-purple-500/40 bg-purple-900/10' },
    { title: 'NIGHT OWL', content: 'Select cafes stay open till 4 AM for hardcore grinders.', color: 'border-slate-800' },
    { title: 'WEEKLY CLASH', content: 'Join local tournaments and win premium gear every week.', color: 'border-emerald-500/40' },
  ];
  const fullScrollingBuzz = [...scrollingBuzz, ...scrollingBuzz, ...scrollingBuzz];

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden">
      <Navbar role="user" onLogout={onLogout} onNavigateHome={onNavigateHome} />

      <main className="max-w-[1600px] mx-auto py-8">
        {/* Hero Section */}
        <section className="px-6 mb-16">
          <div className="relative w-full rounded-[48px] overflow-hidden min-h-[500px] flex flex-col items-center justify-center text-center p-12 border border-slate-800/30 shadow-2xl">
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2000" 
                className="w-full h-full object-cover brightness-[0.2] blur-[1px]" 
                alt="Background" 
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/60 via-transparent to-[#020617]"></div>
            </div>

            <div className="relative z-10 space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <p className="text-[#10b981] text-xs font-black uppercase tracking-[0.5em] mb-4">Searching Nearby</p>
              <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter uppercase mb-2">
                Dominate The<br />
                <span className="bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#3b82f6] bg-clip-text text-transparent">Digital & Dirt</span>
              </h1>
              <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10">
                Real-time bookings for elite sports turfs and next-gen gaming cafes.
              </p>

              <div className="relative group w-full max-w-2xl mx-auto">
                <div className="absolute left-6 top-1/2 -translate-y-1/2">
                  <SearchIcon className="w-6 h-6 text-[#10b981]" />
                </div>
                <input 
                  type="text"
                  placeholder="Search city, area or hub name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#0b1120]/60 backdrop-blur-xl border border-slate-700/50 rounded-full py-6 pl-16 pr-8 text-white focus:border-[#10b981] focus:ring-4 focus:ring-[#10b981]/10 outline-none transition-all placeholder:text-slate-500 text-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Top Tier Arenas - Infinite Continuous Scroll */}
        <section className="mb-20 overflow-hidden">
          <div className="px-6 flex items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-[#10b981] rounded-full"></div>
              <h2 className="text-3xl font-black uppercase tracking-tight text-white">Top Tier Arenas</h2>
            </div>
            <span className="bg-slate-800 text-slate-400 text-[10px] font-black px-3 py-1 rounded uppercase tracking-[0.2em]">Community Favs</span>
          </div>

          <div className="relative w-full">
            <div className="flex gap-8 animate-marquee whitespace-nowrap pause-on-hover">
              {scrollingHubs.map((hub, idx) => (
                <div 
                  key={`${hub.id}-${idx}`}
                  onClick={() => onHubSelect(hub)}
                  className="flex-shrink-0 w-[420px] bg-[#0b1120] border border-slate-800 rounded-[40px] overflow-hidden cursor-pointer group transition-all hover:border-[#10b981]/50 shadow-xl inline-block align-top"
                >
                  <div className="h-64 relative overflow-hidden">
                    <img src={hub.image} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] to-transparent opacity-40"></div>
                    <div className="absolute top-4 right-4">
                      <div className="bg-[#10b981]/80 backdrop-blur-md text-[#020617] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-400/30">
                        RATED {hub.rating}
                      </div>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="text-2xl font-black text-white uppercase tracking-tight truncate max-w-[70%]">{hub.name}</h4>
                       <div className="flex items-center gap-1.5 text-yellow-500 text-sm font-black">
                         <StarIcon className="w-4 h-4" /> {hub.rating}
                       </div>
                    </div>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-[0.25em] mb-6">{hub.location}</p>
                    
                    <div className="flex items-center justify-between">
                       <div className="space-y-0.5">
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Entry Pricing</p>
                          <span className="text-3xl font-black text-white">₹{hub.priceStart}</span>
                       </div>
                       <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:bg-[#10b981] group-hover:border-transparent transition-all shadow-inner">
                          <svg className="w-6 h-6 group-hover:text-[#020617] text-[#10b981] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Gradient Masks */}
            <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-[#020617] to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-[#020617] to-transparent z-10 pointer-events-none"></div>
          </div>
        </section>

        {/* Garf Buzz - Info Line Infinite Continuous Scroll */}
        <section className="mb-20 overflow-hidden">
          <div className="px-6 flex items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-purple-600 rounded-full shadow-[0_0_15px_rgba(147,51,234,0.5)]"></div>
              <h2 className="text-3xl font-black uppercase tracking-tight text-white">Garf Buzz</h2>
            </div>
            <span className="bg-purple-900/30 text-purple-400 text-[10px] font-black px-3 py-1 rounded border border-purple-500/20 uppercase tracking-[0.2em]">Ads & Lines</span>
          </div>

          <div className="relative w-full">
            <div className="flex gap-6 animate-marquee-reverse pause-on-hover">
              {fullScrollingBuzz.map((buzz, idx) => (
                <div 
                  key={idx}
                  className={`flex-shrink-0 w-[480px] p-10 rounded-[40px] border ${buzz.color} backdrop-blur-sm relative overflow-hidden group hover:scale-[1.02] transition-all cursor-pointer`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Info Line</p>
                      <h4 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">{buzz.title}</h4>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-slate-800 group-hover:bg-purple-500 transition-colors"></div>
                  </div>
                  <p className="text-slate-400 text-base font-medium leading-relaxed max-w-[85%]">{buzz.content}</p>
                </div>
              ))}
            </div>
            {/* Gradient Masks */}
            <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-[#020617] to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-[#020617] to-transparent z-10 pointer-events-none"></div>
          </div>
        </section>

        {/* Explore Genres Section */}
        <section className="px-6 mb-12">
          <div className="bg-[#0b1120] border border-slate-800 rounded-[56px] p-16 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-1000">
                <svg className="w-64 h-64 text-emerald-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
             </div>

             <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                <div className="space-y-4">
                   <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em]">Ready to Enter?</p>
                   <h2 className="text-6xl font-black uppercase tracking-tighter text-white">Explore Genres</h2>
                   <p className="text-slate-400 text-lg font-medium max-w-md">Find the perfect match for your next training session or gaming marathon.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-6">
                   <div className="px-12 py-7 bg-[#10b981] hover:bg-[#34d399] text-[#020617] rounded-3xl font-black uppercase text-sm tracking-[0.2em] cursor-pointer hover:-translate-y-1 transition-all shadow-[0_10px_40px_rgba(16,185,129,0.25)]">
                      Sports Turfs
                   </div>
                   <div className="px-12 py-7 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl font-black uppercase text-sm tracking-[0.2em] cursor-pointer hover:-translate-y-1 transition-all shadow-[0_10px_40px_rgba(37,99,235,0.25)]">
                      Gaming Hubs
                   </div>
                </div>
             </div>
          </div>
        </section>
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-33.333% - 1.333rem)); }
        }

        @keyframes marquee-reverse {
          0% { transform: translateX(calc(-33.333% - 1rem)); }
          100% { transform: translateX(0); }
        }

        .animate-marquee {
          animation: marquee 60s linear infinite;
        }

        .animate-marquee-reverse {
          animation: marquee-reverse 50s linear infinite;
        }

        .pause-on-hover:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;
