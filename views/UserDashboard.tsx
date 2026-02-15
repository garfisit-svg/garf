import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { GARF_BUZZ } from '../constants';
import { Hub, Booking, ChatRoom, ChatMessage, Poll, PollOption } from '../types';
import { SearchIcon, StarIcon, MapPinIcon, GamepadIcon, TrophyIcon } from '../components/Icons';

interface UserDashboardProps {
  hubs: Hub[];
  nickname: string;
  currentUserId?: string;
  bookings: Booking[];
  chatRooms: ChatRoom[];
  onLogout: () => void;
  onHubSelect: (hub: Hub) => void;
  onNavigateHome: () => void;
  onSendMessage: (roomId: string, message: Partial<ChatMessage>) => void;
  onDeleteMessage: (roomId: string, messageId: string) => void;
  onVotePoll: (roomId: string, messageId: string, optionIndex: number) => void;
  onCreateSquad: (name: string) => Promise<string>;
  onJoinSquad: (code: string) => Promise<string | null>;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ 
  hubs, 
  nickname, 
  currentUserId,
  bookings, 
  chatRooms,
  onLogout, 
  onHubSelect, 
  onNavigateHome,
  onSendMessage,
  onDeleteMessage,
  onVotePoll,
  onCreateSquad,
  onJoinSquad
}) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'explore' | 'community' | 'history'>('explore');
  const [filterType, setFilterType] = useState<'ALL' | 'TURF' | 'GAMING CAFE'>('ALL');
  const [sortBy, setSortBy] = useState<'RATING' | 'PRICE_LOW' | 'PRICE_HIGH'>('RATING');
  
  const [activeRoomId, setActiveRoomId] = useState<string>('global');
  const [chatInput, setChatInput] = useState('');
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [showSquadModal, setShowSquadModal] = useState(false);
  const [squadNameInput, setSquadNameInput] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [squadModalTab, setSquadModalTab] = useState<'create' | 'join'>('create');
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'community') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeRoomId, chatRooms, activeTab]);

  const activeRoom = chatRooms.find(r => r.id === activeRoomId) || chatRooms[0];
  
  const processedHubs = hubs
    .filter(h => {
      const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase()) || h.location.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === 'ALL' || h.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'RATING') return b.rating - a.rating;
      if (sortBy === 'PRICE_LOW') return a.priceStart - b.priceStart;
      if (sortBy === 'PRICE_HIGH') return b.priceStart - a.priceStart;
      return 0;
    });

  const trendingHubs = hubs.filter(h => h.rating >= 4.0);

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(activeRoomId, { text: chatInput, type: 'text' });
    setChatInput('');
  };

  const handleCreateSquadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!squadNameInput.trim()) return;
    try {
      const newId = await onCreateSquad(squadNameInput);
      setActiveRoomId(newId);
      setSquadNameInput('');
      setShowSquadModal(false);
      setActiveTab('community');
    } catch (e) {
      setJoinError("Deployment failed.");
    }
  };

  const handleJoinSquadSubmit = async () => {
    if (joinCodeInput.length !== 4) {
      setJoinError("Join codes are 4 digits.");
      return;
    }
    const roomId = await onJoinSquad(joinCodeInput);
    if (roomId) {
      setActiveRoomId(roomId);
      setShowSquadModal(false);
      setJoinCodeInput('');
      setJoinError(null);
      setActiveTab('community');
    } else {
      setJoinError("Squad frequency not found.");
    }
  };

  const handleCreatePollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = pollOptions.filter(o => o.trim() !== '');
    if (!pollQuestion.trim() || validOptions.length < 2) return;
    const poll: Poll = {
      id: 'poll-' + Date.now(),
      question: pollQuestion,
      options: validOptions.map(text => ({ text, votes: [] })),
      createdBy: nickname
    };
    onSendMessage(activeRoomId, { type: 'poll', poll });
    setPollQuestion('');
    setPollOptions(['', '']);
    setShowPollCreator(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col overflow-x-hidden">
      <Navbar role="user" onLogout={onLogout} onNavigateHome={onNavigateHome} />

      <main className="max-w-[1400px] w-full mx-auto py-2 md:py-4 flex-1 flex flex-col overflow-hidden">
        <div className="px-4 md:px-6 mb-4 flex justify-center overflow-x-auto no-scrollbar shrink-0">
          <div className="bg-[#0b1120] border border-slate-800 rounded-[20px] p-1 flex gap-0.5 shadow-xl shrink-0">
            {['explore', 'community', 'history'].map((t) => (
              <button 
                key={t} 
                onClick={() => setActiveTab(t as any)} 
                className={`px-6 md:px-8 py-2 md:py-3 rounded-[16px] font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all ${activeTab === t ? 'bg-[#10b981] text-[#020617] shadow-lg shadow-emerald-500/10' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'explore' && (
          <div className="space-y-6 animate-in fade-in duration-700 overflow-y-auto no-scrollbar pb-16">
             {/* THE ICONIC CENTERED HERO - COMPACTED */}
             <section className="px-4 md:px-6">
              <div className="relative w-full rounded-[30px] md:rounded-[40px] overflow-hidden min-h-[350px] md:min-h-[420px] flex flex-col items-center justify-center text-center p-6 md:p-8 border border-slate-800/30">
                <div className="absolute inset-0 z-0">
                  <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover brightness-[0.04]" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/40 via-transparent to-[#020617]"></div>
                </div>

                <div className="relative z-10 space-y-6 max-w-3xl w-full animate-in slide-in-from-bottom-6 duration-1000">
                  <div className="flex items-center justify-center gap-4 mb-1">
                    <GamepadIcon className="w-10 h-10 md:w-12 md:h-12 text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white">
                      <span className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-cyan-500 bg-clip-text text-transparent">GARF</span>
                    </h1>
                    <TrophyIcon className="w-10 h-10 md:w-12 md:h-12 text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]" />
                  </div>

                  <h2 className="text-3xl md:text-5xl font-black text-white leading-[1] uppercase tracking-tighter">
                    DOMINATE THE<br/>
                    <span className="text-emerald-500">DIGITAL & DIRT</span>
                  </h2>

                  <div className="relative w-full max-w-lg mx-auto mt-6 group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2">
                      <SearchIcon className="w-5 h-5 text-emerald-500 group-focus-within:text-white transition-all" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Identify your arena..." 
                      value={search} 
                      onChange={(e) => setSearch(e.target.value)} 
                      className="w-full bg-[#0b1120]/70 backdrop-blur-3xl border border-slate-700/40 rounded-full py-4 pl-14 pr-6 text-white outline-none font-bold shadow-2xl focus:border-emerald-500/60 transition-all text-lg placeholder:text-slate-600" 
                    />
                  </div>
                </div>
              </div>
            </section>

             {/* LIVE ARENA FEED (TURF MARQUEE) - SMALLER */}
             {trendingHubs.length > 0 && (
               <section className="overflow-hidden bg-transparent py-1">
                  <div className="px-8 mb-2 flex items-center gap-3">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Live Tactical Feed</span>
                    <div className="h-[1px] flex-1 bg-slate-800/20"></div>
                  </div>
                  <div className="flex gap-3 animate-marquee-fast whitespace-nowrap px-6">
                    {[...trendingHubs, ...trendingHubs, ...trendingHubs].map((hub, i) => (
                      <div key={i} onClick={() => onHubSelect(hub)} className="flex-shrink-0 bg-[#0b1120] border border-slate-800 rounded-[24px] p-3 flex items-center gap-4 min-w-[280px] hover:border-emerald-500/50 hover:shadow-xl transition-all cursor-pointer group shadow-lg">
                        <div className="w-12 h-12 rounded-[14px] overflow-hidden border border-slate-700 shrink-0">
                          <img src={hub.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <h4 className="text-xs font-black text-white uppercase truncate">{hub.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/5 px-1.5 py-0.5 rounded uppercase tracking-widest border border-emerald-500/5">{hub.type}</span>
                            <span className="text-[9px] font-black text-yellow-500 flex items-center gap-0.5">{hub.rating} ★</span>
                          </div>
                        </div>
                        <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-black text-white">₹{hub.priceStart}</div>
                      </div>
                    ))}
                  </div>
               </section>
             )}

             {/* GARF BUZZ MARQUEE - COMPACT */}
             <section className="overflow-hidden bg-transparent py-4 border-y border-slate-800/30">
                <div className="flex gap-6 animate-marquee whitespace-nowrap px-6">
                  {[...GARF_BUZZ, ...GARF_BUZZ, ...GARF_BUZZ].map((item, i) => (
                    <div key={i} className="flex-shrink-0 bg-[#0b1120]/40 backdrop-blur-md border border-slate-800 rounded-[20px] p-3.5 flex flex-col gap-1.5 min-w-[260px] hover:border-emerald-500/30 transition-all group cursor-default shadow-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-[0.1em] border border-emerald-500/5">{item.tag}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      </div>
                      <h4 className="text-xs font-black text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors">{item.title}</h4>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest line-clamp-1">{item.content}</p>
                    </div>
                  ))}
                </div>
             </section>

             {/* SQUAD DEPLOYMENT PORTAL - SHRUNKEN */}
             <section className="px-4 md:px-6">
                <div 
                  onClick={() => setShowSquadModal(true)}
                  className="bg-gradient-to-r from-[#0b1120] to-[#020617] border border-slate-800 rounded-[30px] p-6 flex flex-col md:flex-row items-center justify-between gap-4 cursor-pointer hover:border-emerald-500/30 hover:shadow-xl transition-all group overflow-hidden relative shadow-inner"
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 blur-[80px] pointer-events-none"></div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-all duration-500">
                       <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <div className="text-left">
                       <h4 className="text-xl font-black text-white uppercase tracking-tighter">Initialize Tactical Squad</h4>
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-0.5">Establish private frequencies for team coordination</p>
                    </div>
                  </div>
                  <button className="bg-emerald-500 text-black font-black px-8 py-3 rounded-xl text-[10px] uppercase tracking-widest relative z-10 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all">Deploy Unit</button>
                </div>
             </section>

             {/* FILTER & SORT GRID - REFINED */}
             <section className="px-4 md:px-6">
                <div className="bg-[#0b1120]/50 backdrop-blur-2xl border border-slate-800 rounded-[24px] p-3 md:p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
                   <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
                      {[
                        { id: 'ALL', label: 'All Units' },
                        { id: 'TURF', label: 'Turfs' },
                        { id: 'GAMING CAFE', label: 'Cafes' }
                      ].map((type) => (
                        <button 
                          key={type.id}
                          onClick={() => setFilterType(type.id as any)}
                          className={`flex-shrink-0 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all border ${filterType === type.id ? 'bg-emerald-500 border-emerald-400 text-black shadow shadow-emerald-500/10' : 'bg-slate-900/50 text-slate-500 hover:text-white border-slate-800'}`}
                        >
                          {type.label}
                        </button>
                      ))}
                   </div>
                   <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto items-center">
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mr-2 hidden lg:block">Tactical Sort</span>
                      {[
                        { id: 'RATING', label: 'Top Rated' },
                        { id: 'PRICE_LOW', label: 'Price: Low' },
                        { id: 'PRICE_HIGH', label: 'Price: High' }
                      ].map((sort) => (
                        <button 
                          key={sort.id}
                          onClick={() => setSortBy(sort.id as any)}
                          className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all border ${sortBy === sort.id ? 'bg-white border-white text-black shadow shadow-white/5' : 'bg-slate-900/50 text-slate-500 hover:text-white border-slate-800'}`}
                        >
                          {sort.label}
                        </button>
                      ))}
                   </div>
                </div>
             </section>

             <section className="px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-4">
                {processedHubs.map(h => (
                  <div key={h.id} onClick={() => onHubSelect(h)} className="bg-[#0b1120] border border-slate-800 rounded-[32px] overflow-hidden group hover:-translate-y-2 hover:border-emerald-500/30 transition-all duration-500 cursor-pointer shadow-xl relative">
                    <div className="relative h-48 md:h-56">
                      <img src={h.images[0]} className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-transparent to-transparent opacity-70"></div>
                      <div className="absolute top-5 left-5 bg-emerald-500 text-black font-black text-[9px] px-4 py-1.5 rounded-full uppercase tracking-[0.15em] shadow-xl border border-emerald-400/30">{h.type}</div>
                      <div className="absolute bottom-5 left-5 flex items-center gap-2">
                         <div className="bg-[#020617]/90 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-slate-700 text-yellow-500 text-[11px] font-black flex items-center gap-1.5 shadow-xl">
                           {h.rating} <StarIcon className="w-3 h-3" />
                         </div>
                      </div>
                    </div>
                    <div className="p-6 md:p-8">
                      <h4 className="text-xl md:text-2xl font-black text-white uppercase truncate mb-0.5 tracking-tighter">{h.name}</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mt-1"><MapPinIcon className="w-3.5 h-3.5 text-emerald-500"/> {h.location}</p>
                      <div className="flex justify-between items-center mt-6 pt-5 border-t border-slate-800/40">
                        <div>
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-0.5">Mission Cost</p>
                          <span className="text-2xl md:text-3xl font-black text-white tracking-tighter">₹{h.priceStart}</span>
                        </div>
                        <div className="w-12 h-12 bg-slate-900 rounded-[18px] flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-all group-hover:rotate-45 shadow-xl border border-slate-800 group-hover:border-emerald-400">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
             </section>
          </div>
        )}

        {activeTab === 'community' && (
          <section className="px-4 md:px-6 flex flex-col flex-1 h-full md:grid md:grid-cols-[250px_1fr] gap-6 overflow-hidden">
            <aside className="bg-[#0b1120] border border-slate-800 rounded-[24px] p-3 flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar shadow-xl h-full">
              <div className="flex flex-row md:flex-col gap-3 flex-1">
                {chatRooms.map(r => (
                  <button key={r.id} onClick={() => setActiveRoomId(r.id)} className={`flex-shrink-0 w-[200px] md:w-full p-4 rounded-[20px] text-left border transition-all ${activeRoomId === r.id ? 'bg-emerald-500 border-emerald-400 text-black shadow shadow-emerald-500/10' : 'bg-[#020617] border-slate-800 text-slate-400 hover:border-slate-600'}`}>
                    <p className="text-[10px] font-black uppercase truncate tracking-widest">{r.name}</p>
                    <p className="text-[8px] font-bold uppercase opacity-60 tracking-wider mt-0.5">{r.isGlobal ? 'Global Arena' : 'Tactical Squad'}</p>
                    {r.joinCode && <p className="text-[8px] font-black text-slate-800 mt-2 bg-black/5 px-2 py-1 rounded-lg inline-block">FREQ: {r.joinCode}</p>}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowSquadModal(true)} className="flex-shrink-0 w-[200px] md:w-full px-6 py-3 border border-dashed border-slate-700 rounded-[16px] text-[9px] font-black text-emerald-500 uppercase tracking-widest transition-colors hover:bg-emerald-500/5 md:sticky md:bottom-0 md:bg-[#0b1120] md:pt-4">+ Deploy Squad</button>
            </aside>

            <div className="flex-1 bg-[#0b1120] border border-slate-800 rounded-[32px] flex flex-col overflow-hidden relative shadow-xl">
              <div className="p-6 md:p-8 border-b border-slate-800 flex justify-between items-center bg-[#020617]/40 backdrop-blur-3xl shrink-0">
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">{activeRoom?.name}</h3>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5">{activeRoom?.description}</p>
                </div>
                {!activeRoom?.isGlobal && <button onClick={() => setShowPollCreator(true)} className="bg-emerald-500/5 text-emerald-500 border border-emerald-500/20 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all">Launch Poll</button>}
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 md:space-y-8 no-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                {activeRoom?.messages.map((m) => (
                  <div key={m.id} className={`flex flex-col ${m.type === 'system' ? 'items-center' : m.senderId === currentUserId ? 'items-end' : 'items-start'}`}>
                    {m.type === 'system' ? (
                      <div className="bg-emerald-500/5 border border-emerald-500/10 px-6 py-2 rounded-2xl text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] my-4 max-w-md text-center shadow border-dashed">
                        {m.text}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-1 px-3">
                           <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">{m.senderNickname}</span>
                           {m.senderId === currentUserId && (
                             <button onClick={() => onDeleteMessage(activeRoomId, m.id)} className="text-red-500/30 hover:text-red-500 transition-colors" title="Decommission Message">
                               <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                             </button>
                           )}
                        </div>
                        {m.type === 'poll' ? (
                          <div className="bg-slate-900 border border-slate-800 rounded-[28px] p-6 w-full max-w-sm space-y-6 shadow-xl relative overflow-hidden">
                            <h4 className="text-base font-black uppercase text-white tracking-tighter relative z-10">{m.poll?.question}</h4>
                            <div className="space-y-3 relative z-10">
                               {m.poll?.options.map((opt, idx) => (
                                 <button key={idx} onClick={() => onVotePoll(activeRoomId, m.id, idx)} className="w-full bg-[#020617] border border-slate-800 rounded-[20px] p-4 text-left transition-all hover:border-emerald-500 group/pollopt">
                                   <div className="flex justify-between items-center mb-2">
                                     <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover/pollopt:text-white transition-colors">{opt.text}</span>
                                     <span className="text-[10px] font-black text-emerald-500">{opt.votes.length} Votes</span>
                                   </div>
                                   <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                                      <div className="bg-emerald-500 h-full transition-all duration-700 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${(opt.votes.length / Math.max(1, m.poll?.options.reduce((a, b) => a + b.votes.length, 0) || 1)) * 100}%` }}></div>
                                   </div>
                                 </button>
                               ))}
                            </div>
                          </div>
                        ) : (
                          <div className={`max-w-[85%] px-5 py-3 rounded-[24px] text-[14px] font-semibold leading-relaxed shadow-lg ${m.senderId === currentUserId ? 'bg-emerald-500 text-[#020617] rounded-tr-none shadow-emerald-500/5' : 'bg-[#020617] border border-slate-800 text-white rounded-tl-none'}`}>
                            {m.text}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendText} className="p-6 md:p-8 bg-[#020617]/95 border-t border-slate-800 flex gap-4 backdrop-blur-3xl shrink-0">
                <input type="text" placeholder="Transmit tactical data..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="flex-1 bg-[#0b1120] border border-slate-800 rounded-[20px] py-4 px-8 outline-none focus:border-emerald-500 text-base font-bold shadow-inner transition-all placeholder:text-slate-700" />
                <button type="submit" className="w-14 h-14 bg-emerald-500 rounded-[20px] flex items-center justify-center text-[#020617] hover:scale-110 active:scale-90 transition-all shadow-xl shadow-emerald-500/30 border border-emerald-400">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </form>
            </div>
          </section>
        )}

        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-16">
            <h2 className="text-5xl font-black uppercase mb-10 mt-6 tracking-tighter">Mission Log</h2>
            <div className="grid gap-6">
              {bookings.length === 0 ? (
                <div className="text-center py-32 border border-dashed border-slate-800 rounded-[40px] bg-[#0b1120]/20 shadow-inner">
                  <p className="text-slate-600 font-black uppercase tracking-[0.4em] text-[11px]">Historical archive is currently empty</p>
                </div>
              ) : (
                bookings.map(b => (
                  <div key={b.id} className="bg-[#0b1120] border border-slate-800 p-8 rounded-[32px] flex flex-col md:flex-row justify-between items-center gap-6 hover:border-emerald-500/30 hover:shadow-xl transition-all duration-500 group shadow-lg">
                    <div className="flex-1 text-center md:text-left">
                      <h4 className="text-3xl font-black uppercase mb-1 tracking-tighter group-hover:text-emerald-400 transition-colors">{b.hubName}</h4>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-2">{b.slotTime} • {b.date}</p>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className={`px-6 py-2.5 rounded-[14px] text-[10px] font-black uppercase tracking-widest border shadow ${b.status === 'confirmed' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' : 'bg-yellow-500/5 text-yellow-500 border-yellow-500/10'}`}>{b.status}</div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Payload</p>
                        <p className="text-3xl font-black text-white tracking-tighter">₹{b.totalPrice}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {showSquadModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-[#020617]/95 backdrop-blur-3xl">
          <div className="bg-[#0b1120] border border-slate-800 rounded-[40px] p-8 w-full max-w-md animate-in zoom-in duration-500 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 blur-[80px] pointer-events-none"></div>
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-8 relative z-10">Squad Deployment</h3>
            <div className="flex gap-2 p-1.5 bg-[#020617] rounded-[20px] border border-slate-800 mb-8 relative z-10 shadow-inner">
              <button onClick={() => setSquadModalTab('create')} className={`flex-1 py-3 rounded-[14px] text-[10px] font-black uppercase tracking-[0.15em] transition-all ${squadModalTab === 'create' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/10' : 'text-slate-500 hover:text-slate-300'}`}>New Frequency</button>
              <button onClick={() => setSquadModalTab('join')} className={`flex-1 py-3 rounded-[14px] text-[10px] font-black uppercase tracking-[0.15em] transition-all ${squadModalTab === 'join' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/10' : 'text-slate-500 hover:text-slate-300'}`}>Sync Squad</button>
            </div>
            {squadModalTab === 'create' ? (
              <form onSubmit={handleCreateSquadSubmit} className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-3">Squad Callsign</label>
                  <input type="text" value={squadNameInput} onChange={(e) => setSquadNameInput(e.target.value)} placeholder="e.g., BRAVO SIX" className="w-full bg-[#020617] border border-slate-800 rounded-[20px] py-4 px-6 outline-none focus:border-emerald-500 text-white font-bold text-lg transition-all shadow-inner" />
                </div>
                <button type="submit" className="w-full py-5 bg-emerald-500 text-black font-black rounded-[20px] uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-emerald-500/20 border border-emerald-400">Establish Link</button>
              </form>
            ) : (
              <div className="space-y-6 relative z-10">
                <div className="space-y-2 text-center">
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-2">Enter Frequency Code</label>
                  <input type="text" maxLength={4} value={joinCodeInput} onChange={(e) => setJoinCodeInput(e.target.value.replace(/\D/g,''))} placeholder="0000" className="w-full bg-[#020617] border border-slate-800 rounded-[20px] py-6 px-6 outline-none focus:border-emerald-500 text-white font-black text-5xl text-center tracking-[0.3em] shadow-inner" />
                </div>
                {joinError && <p className="text-red-500 text-[10px] font-black uppercase text-center tracking-widest animate-pulse">{joinError}</p>}
                <button onClick={handleJoinSquadSubmit} className="w-full py-5 bg-emerald-500 text-black font-black rounded-[20px] uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-emerald-500/20 border border-emerald-400">Establish Link</button>
              </div>
            )}
            <button onClick={() => setShowSquadModal(false)} className="w-full mt-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] hover:text-white transition-colors relative z-10">Abort Mission</button>
          </div>
        </div>
      )}

      {showPollCreator && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-[#020617]/95 backdrop-blur-3xl">
          <div className="bg-[#0b1120] border border-slate-800 rounded-[40px] p-10 w-full max-w-xl animate-in zoom-in duration-500 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] pointer-events-none"></div>
             <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-10 relative z-10">Deploy Tactical Poll</h3>
            <form onSubmit={handleCreatePollSubmit} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-3">Intelligence Query</label>
                <input type="text" value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} placeholder="What is the objective?..." className="w-full bg-[#020617] border border-slate-800 rounded-[20px] py-4 px-6 outline-none focus:border-emerald-500 text-white font-bold text-lg shadow-inner" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-3">Strategic Options</label>
                {pollOptions.map((opt, idx) => (
                  <input key={idx} type="text" value={opt} onChange={(e) => { const n = [...pollOptions]; n[idx] = e.target.value; setPollOptions(n); }} placeholder={`Tactical Option ${idx + 1}`} className="w-full bg-[#020617] border border-slate-800 rounded-[14px] py-3.5 px-6 text-sm font-bold text-white outline-none focus:border-emerald-500 shadow-inner" />
                ))}
              </div>
              <button type="button" onClick={() => setPollOptions([...pollOptions, ''])} className="text-emerald-500 text-[10px] font-black uppercase tracking-widest ml-3 hover:text-emerald-400">+ Add Objective Parameter</button>
              <button type="submit" className="w-full py-5 bg-emerald-500 text-black font-black rounded-[20px] uppercase tracking-widest text-xs hover:scale-105 transition-all mt-4 shadow-xl border border-emerald-400 shadow-emerald-500/10">Launch Poll</button>
              <button onClick={() => setShowPollCreator(false)} type="button" className="w-full text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] hover:text-white transition-colors mt-3">Cancel Deployment</button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 35s linear infinite; width: max-content; display: flex; }
        .animate-marquee-fast { animation: marquee 25s linear infinite; width: max-content; display: flex; }
        .animate-marquee:hover, .animate-marquee-fast:hover { animation-play-state: paused; }
      `}</style>
    </div>
  );
};

export default UserDashboard;