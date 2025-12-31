
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { GARF_BUZZ } from '../constants';
import { Hub, Booking } from '../types';
import { SearchIcon, StarIcon, MapPinIcon } from '../components/Icons';

interface UserDashboardProps {
  hubs: Hub[];
  bookings: Booking[];
  onLogout: () => void;
  onHubSelect: (hub: Hub) => void;
  onNavigateHome: () => void;
}

type SortOption = 'recommended' | 'distance' | 'price' | 'rating';

const UserDashboard: React.FC<UserDashboardProps> = ({ hubs, bookings, onLogout, onHubSelect, onNavigateHome }) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'TURF' | 'GAMING CAFE'>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [activeTab, setActiveTab] = useState<'explore' | 'history'>('explore');
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Auto-request location on component mount
  useEffect(() => {
    if (activeTab === 'explore') {
      handleAutoLocate();
    }
  }, [activeTab]);

  const handleAutoLocate = () => {
    if (userLocation || isLocating) return;
    
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLocating(false);
          setSortBy('distance');
        },
        (error) => {
          console.error("Geolocation Error:", error.message);
          setIsLocating(false);
        },
        { 
          enableHighAccuracy: false, 
          timeout: 20000,            
          maximumAge: 300000         
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const filteredHubs = hubs
    .filter(hub => {
      const matchesSearch = hub.name.toLowerCase().includes(search.toLowerCase()) || 
                            hub.location.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filterType === 'ALL' || hub.type === filterType;
      return matchesSearch && matchesFilter;
    })
    .map(hub => {
      let distance = Infinity;
      if (userLocation && hub.lat && hub.lng) {
        distance = getDistance(userLocation.lat, userLocation.lng, hub.lat, hub.lng);
      }
      return { ...hub, distance };
    })
    .sort((a, b) => {
      if (sortBy === 'distance' && userLocation) {
        return a.distance - b.distance;
      }
      if (sortBy === 'price') {
        return a.priceStart - b.priceStart;
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      if (a.isBestSeller && !b.isBestSeller) return -1;
      if (!a.isBestSeller && b.isBestSeller) return 1;
      return 0;
    });

  // These hubs appear in the featured marquee
  const bestSellers = hubs.filter(h => (h.isBestSeller || h.rating >= 4.7) && !h.isSoldOut);
  const marqueeHubs = [...bestSellers, ...bestSellers, ...bestSellers, ...bestSellers];
  const marqueeBuzz = [...GARF_BUZZ, ...GARF_BUZZ, ...GARF_BUZZ, ...GARF_BUZZ, ...GARF_BUZZ, ...GARF_BUZZ];

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden">
      <Navbar role="user" onLogout={onLogout} onNavigateHome={onNavigateHome} />

      <main className="max-w-[1600px] mx-auto py-8">
        
        {/* Navigation Tabs */}
        <div className="px-6 mb-12 flex justify-center">
          <div className="bg-[#0b1120] border border-slate-800 rounded-[24px] p-2 flex gap-1 shadow-2xl">
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-10 py-4 rounded-[18px] font-black text-[12px] uppercase tracking-widest transition-all duration-300 ${
                activeTab === 'explore' ? 'bg-[#10b981] text-[#020617] shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Explore Arenas
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-10 py-4 rounded-[18px] font-black text-[12px] uppercase tracking-widest transition-all duration-300 ${
                activeTab === 'history' ? 'bg-[#10b981] text-[#020617] shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Booking History
            </button>
          </div>
        </div>

        {activeTab === 'explore' ? (
          <>
            <section className="px-6 mb-16">
              <div className="relative w-full rounded-[60px] overflow-hidden min-h-[400px] flex flex-col items-center justify-center text-center p-12 border border-slate-800/30 shadow-2xl group/hero">
                <div className="absolute inset-0 z-0">
                  <img 
                    src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=2000" 
                    className="w-full h-full object-cover brightness-[0.08] blur-[2px] transition-transform duration-1000" 
                    alt="" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617]"></div>
                </div>

                <div className="relative z-10 space-y-6 w-full max-w-4xl">
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2">
                       <span className={`w-2 h-2 rounded-full ${userLocation ? 'bg-emerald-500' : 'bg-slate-600 animate-pulse'}`}></span>
                       <p className="text-[#10b981] text-[10px] font-black uppercase tracking-[0.5em]">
                         {userLocation ? 'PROXIMITY SYNCED' : isLocating ? 'LOCATING AREA...' : 'AWAITING LOCATION'}
                       </p>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white leading-[0.9] uppercase tracking-tighter">
                      DOMINATE THE<br />
                      <span className="bg-gradient-to-r from-[#10b981] via-emerald-400 to-cyan-500 bg-clip-text text-transparent">DIGITAL & DIRT</span>
                    </h1>
                    <p className="text-slate-400 text-sm md:text-base font-medium max-w-lg mx-auto opacity-70">
                      Elite venues and high-performance gaming lounges mapped to your exact location for instant booking.
                    </p>
                  </div>

                  <div className="relative group w-full max-w-2xl mx-auto">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none">
                      <SearchIcon className="w-6 h-6 text-[#10b981]" />
                    </div>
                    <input 
                      type="text"
                      placeholder="Search city, area or hub name..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-[#0b1120]/80 backdrop-blur-3xl border border-slate-700/50 rounded-[28px] py-5 pl-16 pr-8 text-white focus:border-[#10b981] focus:ring-4 focus:ring-[#10b981]/10 outline-none transition-all placeholder:text-slate-600 text-base shadow-2xl"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Top Tier Marquee - NOW ALWAYS APPEARS */}
            {marqueeHubs.length > 0 && (
              <section className="mb-20 relative overflow-hidden group">
                <div className="px-6 flex items-center gap-4 mb-8">
                  <div className="w-1.5 h-7 bg-[#10b981] rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Top Rated Venues</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-slate-800/80 to-transparent ml-4"></div>
                </div>
                <div className="relative w-full overflow-hidden h-[180px]">
                  <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-[#020617] to-transparent z-10 pointer-events-none"></div>
                  <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-[#020617] to-transparent z-10 pointer-events-none"></div>
                  <div className="flex gap-8 animate-marquee whitespace-nowrap py-3 hover:pause">
                    {marqueeHubs.map((hub, idx) => (
                      <div 
                        key={`${hub.id}-${idx}`}
                        onClick={() => onHubSelect(hub)}
                        className="flex-shrink-0 w-[320px] h-[160px] bg-[#0b1120] border border-slate-800 rounded-[32px] overflow-hidden cursor-pointer group/card transition-all hover:border-[#10b981]/50 relative shadow-2xl hover:-translate-y-2"
                      >
                        <img src={hub.image} className="absolute inset-0 w-full h-full object-cover opacity-30 transition-transform duration-1000" alt="" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/20 to-transparent"></div>
                        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                          <div>
                            <h4 className="text-xl font-black text-white uppercase tracking-tight truncate max-w-[180px] mb-1">{hub.name}</h4>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{hub.location}</p>
                          </div>
                          <div className="bg-[#10b981]/20 backdrop-blur-xl text-[#10b981] text-[11px] font-black px-3 py-1.5 rounded-xl border border-[#10b981]/20">
                            {hub.rating} ★
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Filter & Sort Controls */}
            <section className="px-6 mb-16 flex flex-col md:flex-row items-center justify-center gap-6">
              <div className="flex items-center gap-3 bg-[#0b1120]/50 p-1.5 rounded-[22px] border border-slate-800">
                {[
                  { id: 'ALL', label: 'ALL ARENAS' },
                  { id: 'TURF', label: 'TURFS' },
                  { id: 'GAMING CAFE', label: 'GAMES' }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setFilterType(option.id as any)}
                    className={`px-8 py-3 rounded-[18px] font-black text-[10px] uppercase tracking-[0.2em] border transition-all duration-300 ${
                      filterType === option.id 
                        ? 'bg-[#10b981] border-[#10b981] text-[#020617]' 
                        : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="h-8 w-px bg-slate-800 hidden md:block"></div>

              <div className="flex items-center gap-3 bg-[#0b1120]/50 p-1.5 rounded-[22px] border border-slate-800">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-3">Sort By</span>
                {[
                  { id: 'recommended', label: 'Featured' },
                  { id: 'distance', label: 'Near Me', icon: <MapPinIcon className="w-3 h-3" />, disabled: !userLocation },
                  { id: 'price', label: 'Price' },
                  { id: 'rating', label: 'Rating' }
                ].map((option) => (
                  <button
                    key={option.id}
                    disabled={option.disabled}
                    onClick={() => setSortBy(option.id as any)}
                    className={`px-6 py-3 rounded-[18px] font-black text-[10px] uppercase tracking-[0.2em] border transition-all duration-300 flex items-center gap-2 ${
                      sortBy === option.id 
                        ? 'bg-white border-white text-[#020617]' 
                        : option.disabled 
                          ? 'opacity-30 cursor-not-allowed border-transparent text-slate-700' 
                          : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Garf Buzz Horizontal Movement */}
            <section className="mb-24 relative overflow-hidden">
              <div className="px-6 flex items-center gap-4 mb-8">
                <div className="w-1.5 h-7 bg-purple-600 rounded-full shadow-[0_0_15px_rgba(147,51,234,0.5)]"></div>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-white">System Feed</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-purple-900/40 to-transparent ml-4"></div>
              </div>
              <div className="relative w-full h-[140px] overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-[#020617] to-transparent z-10 pointer-events-none"></div>
                <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-[#020617] to-transparent z-10 pointer-events-none"></div>
                <div className="flex gap-6 animate-marquee-reverse whitespace-nowrap py-3 hover:pause">
                  {marqueeBuzz.map((buzz, idx) => (
                    <div 
                      key={idx}
                      className="flex-shrink-0 w-[280px] h-[100px] p-6 rounded-[24px] border border-purple-500/10 bg-[#0b1120] shadow-xl group hover:border-purple-500/40 transition-all cursor-default relative"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]"></span>
                        <p className="text-[9px] font-black text-purple-400 uppercase tracking-[0.2em]">{buzz.tag}</p>
                      </div>
                      <h4 className="text-[12px] font-black text-white uppercase mb-1.5 truncate tracking-tight">{buzz.title}</h4>
                      <p className="text-[10px] text-slate-500 font-medium leading-tight line-clamp-1 opacity-80">{buzz.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Main Venue List */}
            <section className="px-6 mb-32">
              <div className="flex items-center justify-between mb-12 border-b border-slate-800/50 pb-10">
                <div className="flex items-center gap-5">
                  <div className="w-2.5 h-12 bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)]"></div>
                  <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
                    {sortBy === 'distance' ? 'Nearest Arenas' : sortBy === 'price' ? 'Best Deals' : sortBy === 'rating' ? 'Highest Rated' : 'Available Hubs'}
                  </h2>
                </div>
                <div className="hidden md:flex flex-col items-end">
                   <span className="text-xl font-black text-emerald-500">{filteredHubs.length}</span>
                   <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Units</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredHubs.map((hub) => (
                  <div 
                    key={hub.id}
                    onClick={() => !hub.isSoldOut && onHubSelect(hub)}
                    className={`bg-[#0b1120] border border-slate-800 rounded-[48px] overflow-hidden group relative transition-all duration-500 shadow-2xl ${hub.isSoldOut ? 'opacity-60 grayscale cursor-not-allowed' : 'cursor-pointer hover:border-slate-600 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:-translate-y-2'}`}
                  >
                    <div className="h-64 relative overflow-hidden">
                      <img src={hub.image} className={`w-full h-full object-cover transition-transform duration-1000 ${!hub.isSoldOut ? 'group-hover:scale-110' : ''}`} alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-transparent to-transparent opacity-60"></div>
                      <div className="absolute top-6 right-6 flex flex-col items-end gap-3">
                        <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl backdrop-blur-xl border ${hub.type === 'TURF' ? 'bg-[#10b981]/90 text-[#020617] border-emerald-400/20' : 'bg-blue-600/90 text-white border-blue-400/20'}`}>
                          {hub.type}
                        </span>
                        {userLocation && hub.distance !== Infinity && (
                          <span className={`px-4 py-2 bg-black/80 backdrop-blur-xl text-[#10b981] text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl border ${sortBy === 'distance' ? 'border-[#10b981] animate-pulse' : 'border-emerald-500/30'}`}>
                            {hub.distance.toFixed(1)} km
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-10">
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <h4 className="text-2xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-emerald-400 transition-colors">{hub.name}</h4>
                          <div className="flex items-center gap-2 text-slate-500">
                            <MapPinIcon className="w-4 h-4 text-emerald-500/50" />
                            <span className="text-[12px] font-bold uppercase tracking-widest">{hub.location}</span>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1.5 font-black px-4 py-2 rounded-2xl border transition-all ${sortBy === 'rating' ? 'bg-yellow-500 text-[#020617] border-yellow-400' : 'text-yellow-500 bg-yellow-500/10 border-yellow-500/10'}`}>
                          <StarIcon className="w-4 h-4" />
                          <span className="text-lg">{hub.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-8 border-t border-slate-800/80">
                        <div>
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1.5">Starting From</p>
                          <p className={`text-3xl font-black transition-all ${sortBy === 'price' ? 'text-emerald-400 scale-110 origin-left' : 'text-white'}`}>₹{hub.priceStart}</p>
                        </div>
                        <div className={`w-14 h-14 rounded-[20px] border flex items-center justify-center transition-all duration-300 shadow-inner ${hub.isSoldOut ? 'bg-slate-800 border-slate-700 text-slate-600' : 'bg-slate-900 border-slate-800 group-hover:bg-[#10b981] group-hover:text-[#020617] group-hover:border-transparent group-hover:scale-110'}`}>
                          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          /* Booking History Panel */
          <section className="px-6 py-10 max-w-5xl mx-auto">
            <div className="flex items-center gap-5 mb-16">
              <div className="w-2.5 h-12 bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)]"></div>
              <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter">My Activity</h2>
            </div>

            {bookings.length === 0 ? (
              <div className="bg-[#0b1120] border border-dashed border-slate-800 rounded-[50px] py-32 text-center shadow-inner">
                <p className="text-slate-500 font-black uppercase tracking-[0.3em] mb-6">No Bookings Recorded Yet</p>
                <button onClick={() => setActiveTab('explore')} className="px-10 py-4 bg-[#10b981] text-[#020617] font-black uppercase text-xs rounded-2xl hover:scale-105 transition-all">Start Exploring</button>
              </div>
            ) : (
              <div className="grid gap-8">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-[#0b1120] border border-slate-800 rounded-[40px] p-10 flex flex-col md:flex-row items-center justify-between gap-10 group hover:border-slate-600 transition-all duration-300 shadow-xl">
                    <div className="flex items-center gap-8">
                      <div className="w-20 h-20 rounded-[24px] bg-slate-900 flex items-center justify-center border border-slate-800 group-hover:border-[#10b981]/30 transition-all">
                        <svg className="w-10 h-10 text-slate-600 group-hover:text-[#10b981] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-2xl font-black text-white uppercase truncate max-w-[280px] mb-1 group-hover:text-emerald-400 transition-colors">{booking.hubName}</h4>
                        <p className="text-slate-500 font-black text-[11px] uppercase tracking-[0.2em]">{booking.accessoryName ? `Unit: ${booking.accessoryName}` : 'Standard Arena'}</p>
                      </div>
                    </div>

                    <div className="flex flex-1 items-center justify-around w-full md:w-auto bg-[#020617]/50 rounded-[32px] p-6 border border-slate-800/50">
                      <div className="text-center">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Schedule</p>
                        <p className="text-lg font-black text-white">{booking.slotTime}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Status</p>
                        <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                          booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-3xl font-black text-white mb-1">₹{booking.status === 'confirmed' ? 'PAID' : 'DUE'}</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">TRX ID: {booking.id.slice(-8).toUpperCase()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee { 
          animation: marquee 35s linear infinite; 
          width: max-content; 
          display: flex;
        }
        .animate-marquee-reverse { 
          animation: marquee 45s linear infinite reverse; 
          width: max-content; 
          display: flex;
        }
        .hover\\:pause:hover { 
          animation-play-state: paused; 
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;
