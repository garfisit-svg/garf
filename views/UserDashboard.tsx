import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { GARF_BUZZ } from '../constants';
import { Hub, Booking, ChatRoom, ChatMessage, Poll } from '../types';
import { SearchIcon, StarIcon, MapPinIcon } from '../components/Icons';

interface UserDashboardProps {
  hubs: Hub[];
  nickname: string;
  bookings: Booking[];
  chatRooms: ChatRoom[];
  onLogout: () => void;
  onHubSelect: (hub: Hub) => void;
  onNavigateHome: () => void;
  onSendMessage: (roomId: string, message: Partial<ChatMessage>) => void;
  onVotePoll: (roomId: string, messageId: string, optionIndex: number) => void;
  onCreateSquad: (name: string) => string;
  onJoinSquad: (code: string) => boolean;
}

type SortOption = 'recommended' | 'distance' | 'price' | 'rating';

const UserDashboard: React.FC<UserDashboardProps> = ({ 
  hubs, 
  nickname, 
  bookings, 
  chatRooms,
  onLogout, 
  onHubSelect, 
  onNavigateHome,
  onSendMessage,
  onVotePoll,
  onCreateSquad,
  onJoinSquad
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'TURF' | 'GAMING CAFE'>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [activeTab, setActiveTab] = useState<'explore' | 'community' | 'history'>('explore');
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  
  // Chat State
  const [activeRoomId, setActiveRoomId] = useState<string>('global');
  const [chatInput, setChatInput] = useState('');
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Squad Management State
  const [showSquadModal, setShowSquadModal] = useState(false);
  const [squadNameInput, setSquadNameInput] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [squadModalTab, setSquadModalTab] = useState<'create' | 'join'>('create');

  useEffect(() => {
    if (activeTab === 'explore') {
      handleAutoLocate();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'community') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, activeRoomId, chatRooms]);

  const handleAutoLocate = () => {
    if (userLocation || isLocating) return;
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setIsLocating(false);
          setSortBy('distance');
        },
        () => setIsLocating(false),
        { timeout: 20000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
  };

  const filteredHubs = hubs
    .filter(hub => {
      const matchesSearch = hub.name.toLowerCase().includes(search.toLowerCase()) || hub.location.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filterType === 'ALL' || hub.type === filterType;
      return matchesSearch && matchesFilter;
    })
    .map(hub => ({ ...hub, distance: (userLocation && hub.lat && hub.lng) ? getDistance(userLocation.lat, userLocation.lng, hub.lat, hub.lng) : Infinity }))
    .sort((a, b) => {
      if (sortBy === 'distance' && userLocation) return a.distance - b.distance;
      if (sortBy === 'price') return a.priceStart - b.priceStart;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (a.isBestSeller && !b.isBestSeller) return -1;
      return 1;
    });

  const topRatedHubs = hubs.filter(h => h.rating >= 4.7 && !h.isSoldOut).sort((a, b) => b.rating - a.rating);
  const activeRoom = chatRooms.find(r => r.id === activeRoomId);

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(activeRoomId, { text: chatInput, type: 'text' });
    setChatInput('');
  };

  const handleCreatePoll = (q?: string, opts?: string[]) => {
    const finalQ = q || pollQuestion;
    const finalOpts = opts || pollOptions;
    
    if (!finalQ.trim() || finalOpts.filter(o => o.trim()).length < 2) {
      alert("Please provide a QS (Question) and at least 2 options.");
      return;
    }
    
    const poll: Poll = {
      id: 'p-' + Date.now(),
      question: finalQ,
      createdBy: nickname,
      options: finalOpts.filter(o => o.trim()).map(o => ({ text: o, votes: [] }))
    };
    onSendMessage(activeRoomId, { poll, type: 'poll' });
    setPollQuestion('');
    setPollOptions(['', '']);
    setShowPollCreator(false);
  };

  const handleQuickSet = (type: 'YESNO' | 'TIME' | 'AVAIL') => {
    if (type === 'YESNO') {
      setPollOptions(['Yes', 'No']);
    } else if (type === 'TIME') {
      setPollOptions(['8 PM', '9 PM', '10 PM']);
    } else if (type === 'AVAIL') {
      setPollOptions(["I'm In!", 'Maybe', 'Skip']);
    }
  };

  const handleProcessSquadAction = () => {
    if (squadModalTab === 'create') {
      if (!squadNameInput.trim()) return;
      const newId = onCreateSquad(squadNameInput);
      setActiveRoomId(newId);
      setSquadNameInput('');
      setShowSquadModal(false);
    } else {
      if (!joinCodeInput.trim()) return;
      const success = onJoinSquad(joinCodeInput);
      if (success) {
        const room = chatRooms.find(r => r.id === joinCodeInput.toUpperCase() || r.id.includes(joinCodeInput.toUpperCase()));
        if (room) setActiveRoomId(room.id);
        setJoinCodeInput('');
        setShowSquadModal(false);
      } else {
        alert("Invalid tactical code.");
      }
    }
  };

  const addPollOption = () => {
    if (pollOptions.length < 6) setPollOptions([...pollOptions, '']);
  };

  const removePollOption = (idx: number) => {
    if (pollOptions.length > 2) setPollOptions(pollOptions.filter((_, i) => i !== idx));
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col overflow-x-hidden">
      <Navbar role="user" onLogout={onLogout} onNavigateHome={onNavigateHome} />

      <main className="max-w-[1600px] w-full mx-auto py-4 md:py-8 flex-1 flex flex-col">
        {/* Navigation Tabs - Horizontal Scroll on Mobile */}
        <div className="px-4 md:px-6 mb-8 md:mb-12 flex justify-start md:justify-center overflow-x-auto no-scrollbar shrink-0">
          <div className="bg-[#0b1120] border border-slate-800 rounded-[28px] p-1.5 md:p-2 flex gap-1 shadow-2xl shrink-0">
            {[
              { id: 'explore', label: 'Explore' },
              { id: 'community', label: 'Community' },
              { id: 'history', label: 'History' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 md:px-10 py-3 md:py-4 rounded-[22px] font-black text-[11px] md:text-[13px] uppercase tracking-widest transition-all duration-500 whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-[#10b981] text-[#020617] shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'explore' && (
          <div className="space-y-10 md:space-y-16 animate-in fade-in duration-700">
            {/* Hero Section */}
            <section className="px-4 md:px-6">
              <div className="relative w-full rounded-[40px] md:rounded-[60px] overflow-hidden min-h-[380px] md:min-h-[440px] flex flex-col items-center justify-center text-center p-8 md:p-12 border border-slate-800/30 shadow-2xl">
                <div className="absolute inset-0 z-0">
                  <img src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover brightness-[0.05] blur-[1px]" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617]"></div>
                </div>
                <div className="relative z-10 space-y-6 md:space-y-8 w-full max-w-4xl">
                  <div className="space-y-4 md:space-y-6">
                    <div className="flex items-center justify-center gap-2 md:gap-3">
                       <span className={`w-2 h-2 rounded-full ${userLocation ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]' : 'bg-slate-700 animate-pulse'}`}></span>
                       <p className="text-emerald-400 text-[9px] md:text-[11px] font-black uppercase tracking-[0.5em]">Searching Nearby</p>
                    </div>
                    <h1 className="text-3xl md:text-7xl font-black text-white leading-[1.0] md:leading-[0.9] uppercase tracking-tighter">
                      DOMINATE THE<br />
                      <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent italic">DIGITAL & DIRT</span>
                    </h1>
                    {/* Restored Tagline */}
                    <p className="text-slate-400 text-[10px] md:text-sm font-black uppercase tracking-[0.2em] max-w-2xl mx-auto opacity-80">
                      Real-time bookings for elite sports turfs and next-gen gaming cafes.
                    </p>
                  </div>
                  <div className="relative group w-full max-w-2xl mx-auto mt-4">
                    <div className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 pointer-events-none transition-transform group-focus-within:scale-110"><SearchIcon className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" /></div>
                    <input type="text" placeholder="Search elite hubs, areas or proximity..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#0b1120]/60 backdrop-blur-3xl border border-slate-700/50 rounded-[24px] md:rounded-[28px] py-4 md:py-5 pl-14 md:pl-16 pr-6 md:pr-8 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700 shadow-2xl text-sm md:text-base font-bold" />
                  </div>
                </div>
              </div>
            </section>

            {/* Top Rated Arenas Marquee (Restored) */}
            <section className="space-y-4">
              <div className="px-6 md:px-10 flex items-center justify-between">
                <h3 className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-[0.5em]">Top Rated Arenas</h3>
                <div className="h-px flex-1 mx-6 bg-slate-800/50"></div>
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">Elite Choice</span>
              </div>
              <div className="relative overflow-hidden py-2">
                <div className="flex gap-6 md:gap-8 animate-marquee-fast">
                  {[...topRatedHubs, ...topRatedHubs, ...topRatedHubs].map((hub, idx) => (
                    <div key={`${hub.id}-${idx}`} onClick={() => onHubSelect(hub)} className="flex-shrink-0 w-[260px] md:w-[320px] bg-[#0b1120] border border-slate-800 rounded-[28px] overflow-hidden group cursor-pointer hover:border-emerald-500 transition-all shadow-lg">
                      <div className="h-36 md:h-40 relative overflow-hidden">
                        <img src={hub.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xl px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
                          <StarIcon className="w-3 h-3 text-yellow-400" />
                          <span className="text-xs font-black text-white">{hub.rating}</span>
                        </div>
                      </div>
                      <div className="p-4 md:p-5">
                        <h4 className="text-sm font-black text-white uppercase truncate group-hover:text-emerald-400 transition-colors">{hub.name}</h4>
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{hub.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Garf Buzz Marquee (Restored) */}
            <section className="space-y-4">
              <div className="px-6 md:px-10 flex items-center justify-between">
                <h3 className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-[0.5em]">Garf Buzz</h3>
                <div className="h-px flex-1 mx-6 bg-slate-800/50"></div>
              </div>
              <div className="relative overflow-hidden">
                <div className="flex gap-4 md:gap-6 animate-marquee whitespace-nowrap py-1">
                  {[...GARF_BUZZ, ...GARF_BUZZ, ...GARF_BUZZ, ...GARF_BUZZ].map((buzz, idx) => (
                    <div key={idx} className="flex-shrink-0 bg-[#0b1120]/50 border border-slate-800 rounded-[20px] p-4 w-[240px] md:w-[280px] flex flex-col justify-center group hover:border-emerald-500/30 transition-all">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded text-[8px] font-black uppercase tracking-widest">{buzz.tag}</span>
                        <h4 className="text-[11px] font-black text-white uppercase truncate group-hover:text-emerald-400 transition-colors">{buzz.title}</h4>
                      </div>
                      <p className="text-[9px] text-slate-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">{buzz.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Tactical Control Bar */}
            <section className="px-4 md:px-6">
              <div className="bg-[#0b1120] border border-slate-800 rounded-[28px] md:rounded-[32px] p-4 md:p-6 flex flex-col lg:flex-row items-center justify-between gap-4 md:gap-6 shadow-xl">
                <div className="flex gap-2 p-1 bg-[#020617] rounded-[18px] md:rounded-[20px] border border-slate-800 w-full lg:w-auto overflow-x-auto no-scrollbar shrink-0">
                  {['ALL', 'TURF', 'GAMING CAFE'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilterType(f as any)}
                      className={`px-6 md:px-7 py-2.5 md:py-3 rounded-[14px] md:rounded-[16px] font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                        filterType === f ? 'bg-[#10b981] text-[#020617] shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {f === 'ALL' ? 'All Units' : f === 'TURF' ? 'Pro Turfs' : 'Elite Gaming'}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-4 md:gap-6 w-full lg:w-auto justify-between md:justify-end">
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest">Sort By</span>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="bg-[#020617] border border-slate-800 rounded-xl px-4 md:px-5 py-2 md:py-2.5 text-[10px] md:text-xs font-black text-white uppercase outline-none cursor-pointer">
                      <option value="recommended">Recommended</option>
                      <option value="distance">Nearby (Radar)</option>
                      <option value="price">Price (Low-High)</option>
                      <option value="rating">Top Rated</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* Main Grid */}
            <section className="px-4 md:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 pb-32">
              {filteredHubs.map((hub) => (
                <div key={hub.id} onClick={() => !hub.isSoldOut && onHubSelect(hub)} className={`bg-[#0b1120] border border-slate-800 rounded-[32px] md:rounded-[44px] overflow-hidden group relative transition-all duration-500 shadow-xl ${hub.isSoldOut ? 'opacity-60 grayscale cursor-not-allowed' : 'cursor-pointer hover:border-slate-600 hover:-translate-y-2'}`}>
                  <div className="h-52 md:h-60 relative overflow-hidden">
                    <img src={hub.images[0]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" />
                    <div className="absolute top-4 right-4 md:top-6 md:right-6">
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-2xl backdrop-blur-xl border ${hub.type === 'TURF' ? 'bg-[#10b981]/90 text-[#020617]' : 'bg-blue-600/90 text-white'}`}>{hub.type}</span>
                    </div>
                  </div>
                  <div className="p-7 md:p-9">
                    <div className="flex justify-between items-start mb-3">
                       <h4 className="text-lg md:text-xl font-black text-white uppercase truncate pr-4">{hub.name}</h4>
                       <div className="flex items-center gap-1.5 bg-slate-900/50 px-2.5 py-1.5 rounded-xl border border-slate-800">
                          <StarIcon className="w-3.5 h-3.5 text-yellow-400" />
                          <span className="text-[11px] font-black text-white">{hub.rating}</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-2 mb-6 md:mb-8">
                       <MapPinIcon className="w-3.5 h-3.5 text-slate-600" />
                       <p className="text-[11px] font-bold text-slate-500 uppercase truncate tracking-wide">{hub.location}</p>
                    </div>
                    <div className="flex items-center justify-between pt-7 md:pt-8 border-t border-slate-800/80">
                      <div><p className="text-[9px] font-black text-slate-600 uppercase mb-1 tracking-widest">Starts At</p><p className="text-2xl md:text-3xl font-black text-white tracking-tighter">₹{hub.priceStart}</p></div>
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:bg-[#10b981] group-hover:text-[#020617] transition-all"><svg className="w-6 h-6 md:w-7 md:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></div>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}

        {activeTab === 'community' && (
          <section className="px-4 md:px-6 flex flex-col flex-1 min-h-[500px] max-h-[calc(100vh-180px)] md:grid md:grid-cols-[280px_1fr] gap-4 md:gap-8 overflow-hidden">
            {/* Units Scroller - Horizontal on mobile */}
            <aside className="bg-[#0b1120] border border-slate-800 rounded-[20px] md:rounded-[32px] p-3 md:p-6 flex flex-row md:flex-col gap-3 md:gap-5 overflow-x-auto md:overflow-y-auto no-scrollbar shrink-0 shadow-xl">
              <h3 className="hidden md:block text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] mb-2 px-2">Deployment Units</h3>
              <div className="flex flex-row md:flex-col gap-3">
                {chatRooms.map(room => (
                  <button 
                    key={room.id} 
                    onClick={() => setActiveRoomId(room.id)} 
                    className={`flex-shrink-0 w-[180px] md:w-full p-4 md:p-5 rounded-[16px] md:rounded-[24px] text-left transition-all border whitespace-nowrap overflow-hidden ${activeRoomId === room.id ? 'bg-[#10b981] border-[#10b981] text-[#020617]' : 'bg-[#020617] border-slate-800 text-slate-400 hover:border-slate-600'}`}
                  >
                    <p className="text-[10px] md:text-xs font-black uppercase truncate">{room.name}</p>
                    <p className="text-[8px] md:text-[9px] font-bold uppercase opacity-60 truncate">{room.isGlobal ? 'Main Arena' : `CODE: ${room.id.replace('squad-', '')}`}</p>
                  </button>
                ))}
              </div>
              <button onClick={() => setShowSquadModal(true)} className="flex-shrink-0 px-6 py-3 md:p-5 md:mt-auto bg-slate-800/10 border border-slate-800 border-dashed rounded-[16px] md:rounded-[24px] text-[10px] font-black uppercase tracking-widest text-emerald-500 whitespace-nowrap">+ Join Squad</button>
            </aside>

            {/* Chat Arena */}
            <div className="flex-1 bg-[#0b1120] border border-slate-800 rounded-[24px] md:rounded-[32px] flex flex-col overflow-hidden relative shadow-xl">
              <div className="p-4 md:p-8 border-b border-slate-800 flex justify-between items-center bg-[#020617]/40 backdrop-blur-xl z-20 shrink-0">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-emerald-500 text-lg md:text-xl shrink-0">{activeRoom?.name.charAt(0)}</div>
                  <div className="min-w-0">
                    <h3 className="text-base md:text-2xl font-black text-white uppercase tracking-tighter truncate">{activeRoom?.name}</h3>
                    <p className="text-[8px] md:text-[9px] text-slate-500 font-bold uppercase truncate">{activeRoom?.description}</p>
                  </div>
                </div>
                <button onClick={() => setShowPollCreator(!showPollCreator)} className={`bg-purple-600/10 text-purple-400 border border-purple-600/20 px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all ${showPollCreator ? 'bg-purple-600 text-white' : ''}`}>Poll</button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 md:p-12 space-y-8 md:space-y-10 no-scrollbar relative">
                {activeRoom?.messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.senderNickname === nickname ? 'items-end' : 'items-start'} ${msg.isSystem ? 'items-center' : ''}`}>
                    {!msg.isSystem && <p className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase mb-2 px-2">{msg.senderNickname}</p>}
                    {msg.isSystem ? (
                      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-6 py-2.5"><p className="text-[9px] md:text-[10px] font-black text-emerald-500 uppercase italic text-center">{msg.text}</p></div>
                    ) : msg.type === 'poll' ? (
                      <div className="bg-purple-900/5 border border-purple-500/20 p-6 md:p-10 rounded-[28px] md:rounded-[40px] w-full max-w-sm shadow-inner relative overflow-hidden">
                        <h4 className="text-sm md:text-xl font-black text-white uppercase mb-6 md:mb-8 leading-tight">QS: {msg.poll?.question}</h4>
                        <div className="space-y-3 md:space-y-4">
                          {msg.poll?.options.map((opt, idx) => {
                            const totalVotes = msg.poll!.options.reduce((acc, curr) => acc + curr.votes.length, 0);
                            const percent = totalVotes === 0 ? 0 : (opt.votes.length / totalVotes) * 100;
                            const hasVoted = opt.votes.includes(nickname);
                            return (
                              <button key={idx} onClick={() => onVotePoll(activeRoomId, msg.id, idx)} className={`w-full relative h-12 md:h-14 rounded-xl md:rounded-2xl border overflow-hidden transition-all ${hasVoted ? 'border-purple-400' : 'border-slate-800 hover:border-slate-700'}`}>
                                <div className="absolute inset-y-0 left-0 bg-purple-500/10 transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                                <div className="relative px-5 md:px-7 flex justify-between items-center h-full">
                                  <span className={`text-[10px] md:text-xs font-black uppercase ${hasVoted ? 'text-purple-400' : 'text-slate-300'}`}>{opt.text}</span>
                                  <span className="text-[8px] md:text-[10px] font-black text-slate-600">{opt.votes.length} Votes</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className={`max-w-[85%] px-5 md:px-7 py-3 md:py-4 rounded-[20px] md:rounded-[28px] text-sm md:text-base font-medium ${msg.senderNickname === nickname ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'}`}>{msg.text}</div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />

                {/* Poll Architect */}
                {showPollCreator && (
                  <div className="absolute inset-x-4 md:inset-x-8 bottom-4 md:bottom-10 bg-[#0b1120] border border-purple-500/40 p-6 md:p-10 rounded-[32px] md:rounded-[44px] shadow-[0_-30px_90px_rgba(0,0,0,0.95)] animate-in slide-in-from-bottom-20 duration-500 z-50 backdrop-blur-3xl max-h-[92%] overflow-y-auto no-scrollbar">
                    <div className="flex justify-between items-center mb-6 md:mb-8 sticky top-0 bg-[#0b1120]/95 backdrop-blur-md py-2 z-10">
                      <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">Poll Architect</h4>
                      <button onClick={() => setShowPollCreator(false)} className="text-slate-600 hover:text-white transition-colors bg-slate-900/50 p-2 rounded-xl border border-slate-800">
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                      <button onClick={() => handleQuickSet('YESNO')} className="flex flex-col items-center gap-2 p-3 bg-[#020617]/60 border border-slate-800 rounded-2xl hover:border-purple-500/50 transition-all group">
                         <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 font-black text-[10px]">YN</div>
                         <span className="text-[8px] md:text-[9px] font-black uppercase text-slate-500 group-hover:text-white">Yes/No</span>
                      </button>
                      <button onClick={() => handleQuickSet('TIME')} className="flex flex-col items-center gap-2 p-3 bg-[#020617]/60 border border-slate-800 rounded-2xl hover:border-purple-500/50 transition-all group">
                         <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                         <span className="text-[8px] md:text-[9px] font-black uppercase text-slate-500 group-hover:text-white">Timing</span>
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[9px] md:text-[10px] font-black text-purple-400 uppercase tracking-widest ml-4">QS (Tactical Question)</label>
                        <input type="text" placeholder="Squad Directive Question..." value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} className="w-full bg-[#020617]/80 border border-slate-800 rounded-xl md:rounded-2xl py-4 md:py-5 px-6 md:px-8 text-white outline-none focus:border-purple-500 font-bold text-sm md:text-base" />
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between ml-4 pr-4">
                          <label className="text-[9px] md:text-[10px] font-black text-purple-400 uppercase tracking-widest">Options Config</label>
                          <button onClick={addPollOption} disabled={pollOptions.length >= 6} className="text-[8px] md:text-[10px] font-black bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-md hover:bg-purple-500 hover:text-white transition-all disabled:opacity-30">+ Add</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {pollOptions.map((opt, i) => (
                            <div key={i} className="relative group">
                              <input type="text" placeholder={`Option ${i+1}`} value={opt} onChange={(e) => { const next = [...pollOptions]; next[i] = e.target.value; setPollOptions(next); }} className="w-full bg-[#020617]/80 border border-slate-800 rounded-lg md:rounded-xl py-3.5 md:py-4 px-5 md:px-6 text-[10px] md:text-xs text-white outline-none focus:border-purple-500 font-black uppercase tracking-widest pr-10" />
                              {pollOptions.length > 2 && (
                                <button onClick={() => removePollOption(i)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-700 hover:text-red-400 transition-colors p-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => handleCreatePoll()} className="w-full py-4 md:py-5 bg-purple-600 text-white font-black rounded-xl md:rounded-[24px] uppercase text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] shadow-2xl shadow-purple-500/20 hover:scale-[1.01] transition-all">Broadcast Directive</button>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendText} className="p-4 md:p-8 bg-[#020617]/60 border-t border-slate-800 flex gap-3 md:gap-4 backdrop-blur-3xl z-20 shrink-0">
                <input type="text" placeholder="Type tactical request..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="flex-1 bg-[#0b1120] border border-slate-800 rounded-[18px] md:rounded-[28px] py-3.5 md:py-5 px-5 md:px-8 outline-none focus:border-emerald-500 transition-all text-xs md:text-sm font-medium" />
                <button type="submit" className="w-12 h-12 md:w-16 md:h-16 bg-emerald-500 rounded-xl md:rounded-3xl flex items-center justify-center text-[#020617] shadow-2xl shadow-emerald-500/20 hover:scale-105 transition-all">
                  <svg className="w-5 h-5 md:w-7 md:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </form>
            </div>
          </section>
        )}

        {activeTab === 'history' && (
          <section className="px-4 md:px-6 py-6 md:py-8 max-w-4xl mx-auto animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-4 md:gap-5 mb-10 md:mb-16"><div className="w-2 h-10 md:w-2.5 md:h-12 bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)]"></div><h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Mission Log</h2></div>
            {bookings.length === 0 ? (
              <div className="bg-[#0b1120] border border-dashed border-slate-800 rounded-[32px] md:rounded-[40px] py-24 md:py-32 text-center"><p className="text-slate-600 font-black uppercase tracking-[0.3em] md:tracking-[0.4em] mb-8">No Operations Found</p></div>
            ) : (
              <div className="grid gap-4 md:gap-6">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-[#0b1120] border border-slate-800 rounded-[24px] md:rounded-[36px] p-6 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-10 group hover:border-slate-600 transition-all duration-300 shadow-xl">
                    <div className="flex items-center gap-6 md:gap-8"><div className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-[24px] bg-slate-900 flex items-center justify-center border border-slate-800 group-hover:border-emerald-500 transition-all"><svg className="w-8 h-8 md:w-10 md:h-10 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div><div><h4 className="text-lg md:text-2xl font-black text-white uppercase mb-1 truncate max-w-[150px] md:max-w-[200px]">{booking.hubName}</h4><p className="text-slate-600 font-black text-[9px] md:text-[10px] uppercase tracking-widest">{booking.accessoryName || 'Main Arena'}</p></div></div>
                    <div className="flex flex-1 items-center justify-around w-full lg:w-auto bg-[#020617]/40 rounded-2xl md:rounded-[32px] p-4 md:p-6 border border-slate-800/30"><div className="text-center"><p className="text-[8px] md:text-[9px] font-black text-slate-700 uppercase mb-1 tracking-widest">Time</p><p className="text-sm md:text-base font-black text-white">{booking.slotTime}</p></div><div className="text-center"><p className="text-[8px] md:text-[9px] font-black text-slate-700 uppercase mb-1 tracking-widest">Status</p><span className={`px-4 md:px-5 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest ${booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{booking.status}</span></div></div>
                    <div className="text-right"><p className="text-xl md:text-3xl font-black text-white tracking-tighter">₹{booking.status === 'confirmed' ? 'SECURED' : 'PENDING'}</p></div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Squad Modal */}
      {showSquadModal && (
        <div className="fixed inset-0 z-[100] bg-[#020617]/95 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="bg-[#0b1120] border border-slate-800 rounded-[32px] md:rounded-[50px] p-8 md:p-12 w-full max-w-lg shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-8 md:mb-12">
              <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">Squad Portal</h3>
              <button onClick={() => setShowSquadModal(false)} className="text-slate-600 hover:text-white transition-colors"><svg className="w-8 h-8 md:w-10 md:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="flex gap-3 md:gap-4 p-1.5 bg-[#020617] rounded-[24px] md:rounded-[28px] border border-slate-800 mb-8 md:mb-10">
              <button onClick={() => setSquadModalTab('create')} className={`flex-1 py-3.5 md:py-4.5 rounded-[18px] md:rounded-[22px] font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all ${squadModalTab === 'create' ? 'bg-emerald-500 text-[#020617]' : 'text-slate-600 hover:text-slate-300'}`}>New Squad</button>
              <button onClick={() => setSquadModalTab('join')} className={`flex-1 py-3.5 md:py-4.5 rounded-[18px] md:rounded-[22px] font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all ${squadModalTab === 'join' ? 'bg-blue-500 text-white' : 'text-slate-600 hover:text-slate-300'}`}>Join Squad</button>
            </div>
            <div className="space-y-6 md:space-y-8">
              {squadModalTab === 'create' ? (
                <div className="space-y-3 md:space-y-4">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] px-4">Deployment Code-Name</label>
                  <input type="text" placeholder="e.g. Strike Force" value={squadNameInput} onChange={(e) => setSquadNameInput(e.target.value)} className="w-full bg-[#020617] border border-slate-800 rounded-[24px] py-5 md:py-6 px-8 md:px-10 outline-none focus:border-emerald-500 font-bold text-xl md:text-2xl" />
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] px-4">Sync Access Code</label>
                  <input type="text" placeholder="XXXX" value={joinCodeInput} onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())} className="w-full bg-[#020617] border border-slate-800 rounded-[24px] py-6 md:py-7 px-8 md:px-10 outline-none focus:border-blue-500 font-black text-2xl md:text-4xl tracking-[0.5em] md:tracking-[0.8em] text-center" />
                </div>
              )}
              <button onClick={handleProcessSquadAction} className={`w-full py-5 md:py-6 mt-2 md:mt-4 rounded-[24px] md:rounded-[28px] font-black text-xs md:text-sm uppercase tracking-[0.2em] transition-all shadow-xl hover:scale-[1.02] ${squadModalTab === 'create' ? 'bg-emerald-500 text-[#020617]' : 'bg-blue-500 text-white'}`}>Establish Connection</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 35s linear infinite; width: max-content; display: flex; }
        .animate-marquee-fast { animation: marquee 25s linear infinite; width: max-content; display: flex; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default UserDashboard;