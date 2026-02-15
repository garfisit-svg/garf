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
      setActiveTab('community'); // Auto-switch to community tab
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
      setActiveTab('community'); // Auto-switch to community tab
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

      <main className="max-w-[1600px] w-full mx-auto py-4 md:py-8 flex-1 flex flex-col overflow-hidden">
        <div className="px-4 md:px-6 mb-8 flex justify-center overflow-x-auto no-scrollbar shrink-0">
          <div className="bg-[#0b1120] border border-slate-800 rounded-[28px] p-1.5 flex gap-1 shadow-2xl shrink-0">
            {['explore', 'community', 'history'].map((t) => (
              <button 
                key={t} 
                onClick={() => setActiveTab(t as any)} 
                className={`px-6 md:px-10 py-3 md:py-4 rounded-[22px] font-black text-[11px] md:text-[13px] uppercase tracking-widest transition-all ${activeTab === t ? 'bg-[#10b981] text-[#020617] shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'explore' && (
          <div className="space-y-8 animate-in fade-in duration-700 overflow-y-auto no-scrollbar pb-20">
             {/* THE BIG CENTERED LOGO HERO SECTION */}
             <section className="px-4 md:px-6">
              <div className="relative w-full rounded-[40px] md:rounded-[60px] overflow-hidden min-h-[500px] flex flex-col items-center justify-center text-center p-8 border border-slate-800/30">
                <div className="absolute inset-0 z-0">
                  <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover brightness-[0.05]" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#020617]"></div>
                </div>

                <div className="relative z-10 space-y-8 max-w-4xl w-full">
                  <div className="flex items-center justify-center gap-6 mb-2 animate-in zoom-in duration-700">
                    <GamepadIcon className="w-12 h-12 md:w-16 md:h-16 text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                    <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white">
                      <span className="bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">GARF</span>
                    </h1>
                    <TrophyIcon className="w-12 h-12 md:w-16 md:h-16 text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]" />
                  </div>

                  <h2 className="text-4xl md:text-6xl font-black text-white leading-[1.1] uppercase tracking-tighter">
                    BOOK GAMING CAFES &<br/>
                    <span className="text-emerald-500">SPORTS TURFS NEAR YOU</span>
                  </h2>

                  <div className="relative w-full max-w-xl mx-auto mt-12 group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2">
                      <SearchIcon className="w-6 h-6 text-emerald-500 group-focus-within:text-white transition-colors" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Search..." 
                      value={search} 
                      onChange={(e) => setSearch(e.target.value)} 
                      className="w-full bg-[#0b1120]/60 backdrop-blur-2xl border border-slate-700/50 rounded-full py-6 pl-16 pr-6 text-white outline-none font-bold shadow-2xl focus:border-emerald-500/50 transition-all text-xl placeholder:text-slate-600" 
                    />
                  </div>
                </div>
              </div>
            </section>

             {/* TURF MARQUEE (MOVING HUBS) */}
             {trendingHubs.length > 0 && (
               <section className="overflow-hidden bg-transparent py-2">
                  <div className="px-6 mb-3 flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Live Arena Feed</span>
                    <div className="h-[1px] flex-1 bg-slate-800/30"></div>
                  </div>
                  <div className="flex gap-4 animate-marquee-fast whitespace-nowrap px-6">
                    {[...trendingHubs, ...trendingHubs, ...trendingHubs].map((hub, i) => (
                      <div key={i} onClick={() => onHubSelect(hub)} className="flex-shrink-0 bg-[#0b1120] border border-slate-800 rounded-[28px] p-4 flex items-center gap-5 min-w-[340px] hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all cursor-pointer group shadow-lg">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-700 shrink-0">
                          <img src={hub.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <h4 className="text-sm font-black text-white uppercase truncate">{hub.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-widest">{hub.type}</span>
                            <span className="text-[10px] font-black text-yellow-500 flex items-center gap-1">{hub.rating} ★</span>
                          </div>
                        </div>
                        <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black text-white">₹{hub.priceStart}</div>
                      </div>
                    ))}
                  </div>
               </section>
             )}

             {/* GARF BUZZ MARQUEE */}
             <section className="overflow-hidden bg-transparent py-6 border-y border-slate-800/50">
                <div className="flex gap-6 animate-marquee whitespace-nowrap px-6">
                  {[...GARF_BUZZ, ...GARF_BUZZ, ...GARF_BUZZ].map((item, i) => (
                    <div key={i} className="flex-shrink-0 bg-[#0b1120]/60 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex flex-col gap-2 min-w-[300px] hover:border-emerald-500/50 transition-all group cursor-default shadow-xl">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-[0.2em]">{item.tag}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      </div>
                      <h4 className="text-xs font-black text-white uppercase tracking-tighter group-hover:text-emerald-400">{item.title}</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest line-clamp-1">{item.content}</p>
                    </div>
                  ))}
                </div>
             </section>

             {/* SQUAD QUICK DEPLOY PORTAL */}
             <section className="px-4 md:px-6">
                <div 
                  onClick={() => setShowSquadModal(true)}
                  className="bg-gradient-to-r from-[#0b1120] to-[#020617] border border-slate-800 rounded-[40px] p-8 flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer hover:border-emerald-500/50 hover:shadow-2xl transition-all group overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] pointer-events-none"></div>
                  <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                       <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <div>
                       <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Initialize Tactical Squad</h4>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Establish a private frequency for your team</p>
                    </div>
                  </div>
                  <button className="bg-emerald-500 text-black font-black px-10 py-4 rounded-2xl text-[11px] uppercase tracking-widest relative z-10 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all">Deploy Now</button>
                </div>
             </section>

             {/* UPDATED FILTER GRID */}
             <section className="px-4 md:px-6">
                <div className="bg-[#0b1120]/40 backdrop-blur-xl border border-slate-800 rounded-[32px] p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
                   <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto p-1">
                      {[
                        { id: 'ALL', label: 'All Units' },
                        { id: 'TURF', label: 'Turfs' },
                        { id: 'GAMING CAFE', label: 'Cafes' }
                      ].map((type) => (
                        <button 
                          key={type.id}
                          onClick={() => setFilterType(type.id as any)}
                          className={`flex-shrink-0 px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border ${filterType === type.id ? 'bg-emerald-500 border-emerald-400 text-black shadow-lg shadow-emerald-500/20' : 'bg-slate-900/50 text-slate-500 hover:text-white border-slate-800'}`}
                        >
                          {type.label}
                        </button>
                      ))}
                   </div>
                   <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto p-1 items-center">
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mr-3 hidden md:block">Filter Grid</span>
                      {[
                        { id: 'RATING', label: 'Top Rated' },
                        { id: 'PRICE_LOW', label: 'Price: Low' },
                        { id: 'PRICE_HIGH', label: 'Price: High' }
                      ].map((sort) => (
                        <button 
                          key={sort.id}
                          onClick={() => setSortBy(sort.id as any)}
                          className={`flex-shrink-0 px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border ${sortBy === sort.id ? 'bg-white border-white text-black shadow-lg shadow-white/10' : 'bg-slate-900/50 text-slate-500 hover:text-white border-slate-800'}`}
                        >
                          {sort.label}
                        </button>
                      ))}
                   </div>
                </div>
             </section>

             <section className="px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-6">
                {processedHubs.map(h => (
                  <div key={h.id} onClick={() => onHubSelect(h)} className="bg-[#0b1120] border border-slate-800 rounded-[48px] overflow-hidden group hover:-translate-y-3 hover:border-emerald-500/40 transition-all duration-500 cursor-pointer shadow-2xl">
                    <div className="relative h-60">
                      <img src={h.images[0]} className="h-full w-full object-cover transition-all duration-1000 group-hover:scale-110" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-transparent to-transparent opacity-60"></div>
                      <div className="absolute top-6 left-6 bg-emerald-500 text-black font-black text-[10px] px-5 py-2 rounded-full uppercase tracking-[0.2em] shadow-xl">{h.type}</div>
                      <div className="absolute bottom-6 left-6 flex items-center gap-2">
                         <div className="bg-[#020617]/90 backdrop-blur-md px-4 py-1.5 rounded-xl border border-slate-700 text-yellow-500 text-[11px] font-black flex items-center gap-1.5 shadow-xl">
                           {h.rating} <StarIcon className="w-3 h-3" />
                         </div>
                      </div>
                    </div>
                    <div className="p-10">
                      <h4 className="text-3xl font-black text-white uppercase truncate mb-1 tracking-tighter">{h.name}</h4>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><MapPinIcon className="w-4 h-4 text-emerald-500"/> {h.location}</p>
                      <div className="flex justify-between items-center mt-10 pt-8 border-t border-slate-800/50">
                        <div>
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Starts From</p>
                          <span className="text-4xl font-black text-white tracking-tighter">₹{h.priceStart}</span>
                        </div>
                        <div className="w-16 h-16 bg-slate-900 rounded-[24px] flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-all group-hover:rotate-45 shadow-xl">
                          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
             </section>
          </div>
        )}

        {activeTab === 'community' && (
          <section className="px-4 md:px-6 flex flex-col flex-1 h-full md:grid md:grid-cols-[280px_1fr] gap-6 overflow-hidden">
            <aside className="bg-[#0b1120] border border-slate-800 rounded-[32px] p-4 flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar shadow-xl h-full">
              <div className="flex flex-row md:flex-col gap-3 flex-1">
                {chatRooms.map(r => (
                  <button key={r.id} onClick={() => setActiveRoomId(r.id)} className={`flex-shrink-0 w-[220px] md:w-full p-5 rounded-[24px] text-left border transition-all ${activeRoomId === r.id ? 'bg-emerald-500 border-emerald-400 text-black shadow-lg shadow-emerald-500/20' : 'bg-[#020617] border-slate-800 text-slate-400 hover:border-slate-600'}`}>
                    <p className="text-[11px] font-black uppercase truncate tracking-widest">{r.name}</p>
                    <p className="text-[9px] font-bold uppercase opacity-60 tracking-wider">{r.isGlobal ? 'Global Hub' : 'Tactical Squad'}</p>
                    {r.joinCode && <p className="text-[9px] font-black text-slate-800 mt-2 bg-black/10 px-2 py-1 rounded inline-block">FREQ: {r.joinCode}</p>}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowSquadModal(true)} className="flex-shrink-0 w-[220px] md:w-full px-6 py-4 border border-dashed border-slate-700 rounded-2xl text-[10px] font-black text-emerald-500 uppercase tracking-widest transition-colors hover:bg-emerald-500/10 md:sticky md:bottom-0 md:bg-[#0b1120] md:pt-4">+ Deploy Squad</button>
            </aside>

            <div className="flex-1 bg-[#0b1120] border border-slate-800 rounded-[40px] flex flex-col overflow-hidden relative shadow-2xl">
              <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-[#020617]/40 backdrop-blur-3xl shrink-0">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{activeRoom?.name}</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">{activeRoom?.description}</p>
                </div>
                {!activeRoom?.isGlobal && <button onClick={() => setShowPollCreator(true)} className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all">Create Poll</button>}
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                {activeRoom?.messages.map((m) => (
                  <div key={m.id} className={`flex flex-col ${m.type === 'system' ? 'items-center' : m.senderId === currentUserId ? 'items-end' : 'items-start'}`}>
                    {m.type === 'system' ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 px-8 py-3 rounded-2xl text-[11px] font-black text-emerald-400 uppercase tracking-[0.25em] my-6 max-w-md text-center shadow-lg">
                        {m.text}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-1.5 px-3">
                           <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">{m.senderNickname}</span>
                           {m.senderId === currentUserId && (
                             <button onClick={() => onDeleteMessage(activeRoomId, m.id)} className="text-red-500/30 hover:text-red-500 transition-colors" title="Decommission Message">
                               <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                             </button>
                           )}
                        </div>
                        {m.type === 'poll' ? (
                          <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 w-full max-w-md space-y-6 shadow-2xl">
                            <h4 className="text-white font-black uppercase text-base tracking-tight">{m.poll?.question}</h4>
                            <div className="space-y-3">
                               {m.poll?.options.map((opt, idx) => (
                                 <button key={idx} onClick={() => onVotePoll(activeRoomId, m.id, idx)} className="w-full bg-[#020617] border border-slate-800 rounded-2xl p-4 text-left transition-all hover:border-emerald-500 group/pollopt">
                                   <div className="flex justify-between items-center mb-2">
                                     <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest group-hover/pollopt:text-white transition-colors">{opt.text}</span>
                                     <span className="text-[11px] font-black text-emerald-500">{opt.votes.length} Votes</span>
                                   </div>
                                   <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                                      <div className="bg-emerald-500 h-full transition-all duration-700" style={{ width: `${(opt.votes.length / Math.max(1, m.poll?.options.reduce((a, b) => a + b.votes.length, 0) || 1)) * 100}%` }}></div>
                                   </div>
                                 </button>
                               ))}
                            </div>
                          </div>
                        ) : (
                          <div className={`max-w-[85%] px-6 py-4 rounded-[28px] text-[15px] font-semibold leading-relaxed ${m.senderId === currentUserId ? 'bg-emerald-500 text-[#020617] rounded-tr-none shadow-xl shadow-emerald-500/10' : 'bg-[#020617] border border-slate-800 text-white rounded-tl-none'}`}>
                            {m.text}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendText} className="p-8 bg-[#020617]/90 border-t border-slate-800 flex gap-4 backdrop-blur-3xl shrink-0">
                <input type="text" placeholder="Transmit tactical data..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="flex-1 bg-[#0b1120] border border-slate-800 rounded-[22px] py-5 px-8 outline-none focus:border-emerald-500 text-base font-bold shadow-inner transition-all" />
                <button type="submit" className="w-16 h-16 bg-emerald-500 rounded-[22px] flex items-center justify-center text-[#020617] hover:scale-110 active:scale-90 transition-all shadow-xl shadow-emerald-500/30">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </form>
            </div>
          </section>
        )}

        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-24">
            <h2 className="text-6xl font-black uppercase mb-14 mt-8 tracking-tighter">Mission Log</h2>
            <div className="grid gap-8">
              {bookings.length === 0 ? (
                <div className="text-center py-40 border border-dashed border-slate-800 rounded-[60px] bg-[#0b1120]/50 shadow-inner">
                  <p className="text-slate-600 font-black uppercase tracking-[0.4em] text-sm">No historical records found in archive</p>
                </div>
              ) : (
                bookings.map(b => (
                  <div key={b.id} className="bg-[#0b1120] border border-slate-800 p-10 rounded-[48px] flex flex-col md:flex-row justify-between items-center gap-8 hover:border-emerald-500/40 hover:shadow-2xl transition-all duration-500">
                    <div className="flex-1 text-center md:text-left">
                      <h4 className="text-4xl font-black uppercase mb-2 tracking-tighter">{b.hubName}</h4>
                      <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.4em]">{b.slotTime} • {b.date}</p>
                    </div>
                    <div className="flex items-center gap-10">
                      <div className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border shadow-lg ${b.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>{b.status}</div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Total Payload</p>
                        <p className="text-4xl font-black text-white tracking-tighter">₹{b.totalPrice}</p>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#020617]/95 backdrop-blur-2xl">
          <div className="bg-[#0b1120] border border-slate-800 rounded-[48px] p-10 w-full max-w-md animate-in zoom-in duration-300 shadow-[0_0_100px_rgba(16,185,129,0.1)]">
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-8">Squad Deployment</h3>
            <div className="flex gap-2 p-1 bg-[#020617] rounded-2xl border border-slate-800 mb-8">
              <button onClick={() => setSquadModalTab('create')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${squadModalTab === 'create' ? 'bg-emerald-500 text-black' : 'text-slate-500'}`}>New Frequency</button>
              <button onClick={() => setSquadModalTab('join')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${squadModalTab === 'join' ? 'bg-emerald-500 text-black' : 'text-slate-500'}`}>Sync Squad</button>
            </div>
            {squadModalTab === 'create' ? (
              <form onSubmit={handleCreateSquadSubmit} className="space-y-6">
                <input type="text" value={squadNameInput} onChange={(e) => setSquadNameInput(e.target.value)} placeholder="Squad Callsign..." className="w-full bg-[#020617] border border-slate-800 rounded-2xl py-5 px-6 outline-none focus:border-emerald-500 text-white font-bold" />
                <button type="submit" className="w-full py-5 bg-emerald-500 text-black font-black rounded-2xl uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-emerald-500/20">Establish Link</button>
              </form>
            ) : (
              <div className="space-y-6">
                <input type="text" maxLength={4} value={joinCodeInput} onChange={(e) => setJoinCodeInput(e.target.value.replace(/\D/g,''))} placeholder="0000" className="w-full bg-[#020617] border border-slate-800 rounded-2xl py-6 px-6 outline-none focus:border-emerald-500 text-white font-black text-5xl text-center tracking-[0.5em]" />
                {joinError && <p className="text-red-500 text-[10px] font-bold uppercase text-center">{joinError}</p>}
                <button onClick={handleJoinSquadSubmit} className="w-full py-5 bg-emerald-500 text-black font-black rounded-2xl uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-emerald-500/20">Establish Link</button>
              </div>
            )}
            <button onClick={() => setShowSquadModal(false)} className="w-full mt-6 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors">Abort Mission</button>
          </div>
        </div>
      )}

      {showPollCreator && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#020617]/95 backdrop-blur-2xl">
          <div className="bg-[#0b1120] border border-slate-800 rounded-[48px] p-12 w-full max-w-xl animate-in zoom-in duration-300">
             <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-8">Deploy Tactical Poll</h3>
            <form onSubmit={handleCreatePollSubmit} className="space-y-6">
              <input type="text" value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} placeholder="Poll Query..." className="w-full bg-[#020617] border border-slate-800 rounded-2xl py-5 px-6 outline-none focus:border-emerald-500 text-white font-bold" />
              <div className="space-y-4">
                {pollOptions.map((opt, idx) => (
                  <input key={idx} type="text" value={opt} onChange={(e) => { const n = [...pollOptions]; n[idx] = e.target.value; setPollOptions(n); }} placeholder={`Option ${idx + 1}`} className="w-full bg-[#020617] border border-slate-800 rounded-xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-emerald-500" />
                ))}
              </div>
              <button type="button" onClick={() => setPollOptions([...pollOptions, ''])} className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">+ Add Intelligence Option</button>
              <button type="submit" className="w-full py-5 bg-emerald-500 text-black font-black rounded-2xl uppercase tracking-widest hover:scale-105 transition-all mt-4">Launch Poll</button>
              <button onClick={() => setShowPollCreator(false)} type="button" className="w-full text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors">Cancel</button>
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