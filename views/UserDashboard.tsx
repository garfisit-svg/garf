
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
  const [showInviteInfo, setShowInviteInfo] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

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
      alert("Please provide a question and at least 2 options.");
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

  const addPollOption = () => {
    if (pollOptions.length >= 6) return;
    setPollOptions([...pollOptions, '']);
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length <= 2) return;
    const next = [...pollOptions];
    next.splice(index, 1);
    setPollOptions(next);
  };

  const handleTemplateSelect = (type: 'TIME' | 'PLAYER' | 'YESNO') => {
    if (type === 'TIME') {
      handleCreatePoll("Squad Preference: Match Start Time?", ["8:00 PM", "9:00 PM", "10:00 PM"]);
    } else if (type === 'PLAYER') {
      handleCreatePoll("Operational Status: Who's joining tonight?", ["I'm In!", "Maybe Later", "Can't Make It"]);
    } else if (type === 'YESNO') {
      handleCreatePoll("Quick Vote: Ready for the match?", ["Yes", "No"]);
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

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden">
      <Navbar role="user" onLogout={onLogout} onNavigateHome={onNavigateHome} />

      <main className="max-w-[1600px] mx-auto py-8">
        
        {/* Navigation Tabs */}
        <div className="px-6 mb-12 flex justify-center">
          <div className="bg-[#0b1120] border border-slate-800 rounded-[28px] p-2 flex gap-1 shadow-2xl relative">
            {[
              { id: 'explore', label: 'Explore' },
              { id: 'community', label: 'Community' },
              { id: 'history', label: 'History' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-10 py-4 rounded-[22px] font-black text-[13px] uppercase tracking-widest transition-all duration-500 whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-[#10b981] text-[#020617] shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'explore' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            {/* Hero Section */}
            <section className="px-6">
              <div className="relative w-full rounded-[60px] overflow-hidden min-h-[440px] flex flex-col items-center justify-center text-center p-12 border border-slate-800/30 shadow-2xl">
                <div className="absolute inset-0 z-0">
                  <img src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover brightness-[0.05] blur-[1px]" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617]"></div>
                </div>
                <div className="relative z-10 space-y-6 w-full max-w-4xl">
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3 mb-2">
                       <span className={`w-2 h-2 rounded-full ${userLocation ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]' : 'bg-slate-700 animate-pulse'}`}></span>
                       <p className="text-emerald-400 text-[11px] font-black uppercase tracking-[0.5em]">
                         Searching Nearby
                       </p>
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black text-white leading-[0.9] uppercase tracking-tighter">
                      DOMINATE THE<br />
                      <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent italic">DIGITAL & DIRT</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-black uppercase tracking-[0.2em] max-w-2xl mx-auto opacity-80">
                      Real-time bookings for elite sports turfs and next-gen gaming cafes.
                    </p>
                  </div>
                  <div className="relative group w-full max-w-2xl mx-auto mt-4">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none"><SearchIcon className="w-6 h-6 text-emerald-400" /></div>
                    <input type="text" placeholder="Search elite hubs, areas or proximity..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#0b1120]/60 backdrop-blur-3xl border border-slate-700/50 rounded-[28px] py-5 pl-16 pr-8 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700 shadow-2xl text-base font-bold" />
                  </div>
                </div>
              </div>
            </section>

            {/* Top Rated Arenas Marquee (First) */}
            <section className="space-y-4">
              <div className="px-10 flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.5em]">Top Rated Arenas</h3>
                <div className="h-px flex-1 mx-6 bg-slate-800/50"></div>
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">Elite Selection</span>
              </div>
              <div className="relative overflow-hidden py-2">
                <div className="flex gap-8 animate-marquee-fast">
                  {[...topRatedHubs, ...topRatedHubs, ...topRatedHubs].map((hub, idx) => (
                    <div key={`${hub.id}-${idx}`} onClick={() => onHubSelect(hub)} className="flex-shrink-0 w-[320px] bg-[#0b1120] border border-slate-800 rounded-[28px] overflow-hidden group cursor-pointer hover:border-emerald-500 transition-all shadow-lg">
                      <div className="h-40 relative overflow-hidden">
                        <img src={hub.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xl px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
                          <StarIcon className="w-3 h-3 text-yellow-400" />
                          <span className="text-xs font-black text-white">{hub.rating}</span>
                        </div>
                      </div>
                      <div className="p-5">
                        <h4 className="text-sm font-black text-white uppercase truncate group-hover:text-emerald-400 transition-colors">{hub.name}</h4>
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{hub.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Garf Buzz Heading & Sliding (Second) */}
            <section className="space-y-4">
              <div className="px-10 flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.5em]">Garf Buzz</h3>
                <div className="h-px flex-1 mx-6 bg-slate-800/50"></div>
              </div>
              <div className="relative overflow-hidden">
                <div className="flex gap-6 animate-marquee whitespace-nowrap py-1">
                  {[...GARF_BUZZ, ...GARF_BUZZ, ...GARF_BUZZ, ...GARF_BUZZ].map((buzz, idx) => (
                    <div key={idx} className="flex-shrink-0 bg-[#0b1120]/50 border border-slate-800 rounded-[20px] p-4 w-[280px] flex flex-col justify-center group hover:border-emerald-500/30 transition-all">
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
            <section className="px-6">
              <div className="bg-[#0b1120] border border-slate-800 rounded-[32px] p-6 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl">
                <div className="flex gap-2 p-1 bg-[#020617] rounded-[20px] border border-slate-800">
                  {[
                    { id: 'ALL', label: 'All Hubs' },
                    { id: 'TURF', label: 'Pro Turfs' },
                    { id: 'GAMING CAFE', label: 'Elite Gaming' }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setFilterType(filter.id as any)}
                      className={`px-7 py-3 rounded-[16px] font-black text-[10px] uppercase tracking-[0.15em] transition-all duration-300 ${
                        filterType === filter.id ? 'bg-[#10b981] text-[#020617] shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Sort By</span>
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-[#020617] border border-slate-800 rounded-xl px-5 py-2.5 text-xs font-black text-white uppercase tracking-widest focus:border-emerald-500 outline-none cursor-pointer hover:bg-slate-900 transition-colors"
                    >
                      <option value="recommended">Recommended</option>
                      <option value="distance">Radar (Nearby)</option>
                      <option value="price">Price: Low-High</option>
                      <option value="rating">Top Rated</option>
                    </select>
                  </div>
                  <div className="h-10 w-px bg-slate-800/50"></div>
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{filteredHubs.length} Units Online</p>
                </div>
              </div>
            </section>

            {/* Main Grid */}
            <section className="px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap