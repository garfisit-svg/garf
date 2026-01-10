import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { GARF_BUZZ } from '../constants';
import { Hub, Booking, ChatRoom, ChatMessage, Poll, PollOption } from '../types';
import { SearchIcon, StarIcon, MapPinIcon } from '../components/Icons';

interface UserDashboardProps {
  hubs: Hub[];
  nickname: string;
  bookings: Booking[];
  chatRooms: ChatRoom[];
  onLogout: () => void;
  onHubSelect: (hub: Hub) => void;
  onNavigateHome: () => void;
  onSendMessage: (roomId: string, message: Partial<ChatMessage>) => void | Promise<void>;
  onVotePoll: (roomId: string, messageId: string, optionIndex: number) => void | Promise<void>;
  onCreateSquad: (name: string) => Promise<string>;
  onJoinSquad: (code: string) => Promise<string | null>;
}

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
  
  // High-performance filtering and sorting
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

  // Top Rated Marquee Data (Rating 4.7+)
  const topRatedHubs = hubs.filter(h => h.rating >= 4.7).sort((a, b) => b.rating - a.rating);

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
    } catch (e) {
      setJoinError("Failed to deploy frequency.");
    }
  };

  const handleJoinSquadSubmit = async () => {
    if (joinCodeInput.length !== 4) {
      setJoinError("Code must be 4 digits.");
      return;
    }
    const roomId = await onJoinSquad(joinCodeInput);
    if (roomId) {
      setActiveRoomId(roomId);
      setShowSquadModal(false);
      setJoinCodeInput('');
      setJoinError(null);
    } else {
      setJoinError("Squad not found. Check code.");
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

  const addPollOption = () => setPollOptions([...pollOptions, '']);
  const updatePollOption = (idx: number, val: string) => {
    const next = [...pollOptions];
    next[idx] = val;
    setPollOptions(next);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col overflow-x-hidden">
      <Navbar role="user" onLogout={onLogout} onNavigateHome={onNavigateHome} />

      <main className="max-w-[1600px] w-full mx-auto py-4 md:py-8 flex-1 flex flex-col">
        {/* Navigation Tabs */}
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
          <div className="space-y-8 animate-in fade-in duration-700">
             {/* Hero Section */}
             <section className="px-4 md:px-6">
              <div className="relative w-full rounded-[40px] md:rounded-[60px] overflow-hidden min-h-[380px] flex flex-col items-center justify-center text-center p-8 border border-slate-800/30 shadow-[0_0_100px_rgba(16,185,129,0.05)]">
                <div className="absolute inset-0 z-0">
                  <img src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover brightness-[0.05]" alt="" />
                </div>
                <div className="relative z-10 space-y-6 max-w-4xl w-full">
                  <h1 className="text-4xl md:text-7xl font-black text-white leading-none uppercase tracking-tighter animate-in slide-in-from-bottom-6 duration-700">
                    THE ARENA<br/><span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent italic">IS YOURS</span>
                  </h1>
                  
                  <div className="space-y-1">
                    <p className="text-emerald-400 text-[10px] md:text-xs font-black uppercase tracking-[0.4em]">Decentralised Venue Discovery • Real-Time Coordination</p>
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Unleash the athlete and gamer within through the Garf secure network.</p>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="relative w-full max-w-2xl mx-auto mt-4">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2"><SearchIcon className="w-5 h-5 text-emerald-400" /></div>
                    <input 
                      type="text" 
                      placeholder="Scanning for turfs and gaming cafes..." 
                      value={search} 
                      onChange={(e) => setSearch(e.target.value)} 
                      className="w-full bg-[#0b1120]/60 backdrop-blur-3xl border border-slate-700/50 rounded-[28px] py-5 pl-16 pr-6 text-white focus:border-emerald-500 outline-none text-sm font-bold shadow-2xl transition-all" 
                    />
                  </div>
                </div>
              </div>
            </section>

             {/* Top Rated Marquee - Moving above the Garf Buzz */}
             {topRatedHubs.length > 0 && (
               <section className="overflow-hidden bg-transparent">
                  <div className="flex gap-6 animate-marquee whitespace-nowrap px-6">
                    {[...topRatedHubs, ...topRatedHubs, ...topRatedHubs].map((hub, i) => (
                      <div key={i} onClick={() => onHubSelect(hub)} className="flex-shrink-0 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 flex items-center gap-4 min-w-[320px] hover:border-yellow-500/50 transition-all cursor-pointer group">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-700">
                          <img src={hub.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-0.5">
                            <h4 className="text-xs font-black text-white uppercase truncate">{hub.name}</h4>
                            <span className="text-[10px] font-black text-yellow-500 flex items-center gap-0.5">{hub.rating} ★</span>
                          </div>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate">{hub.location}</p>
                        </div>
                        <div className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-lg border border-yellow-500/20 text-[8px] font-black tracking-widest uppercase">ELITE</div>
                      </div>
                    ))}
                  </div>
               </section>
             )}

             {/* GARF BUZZ Marquee - Styled as Rectangular Boxes below Search & Top Rated */}
             <section className="overflow-hidden bg-transparent py-4">
                <div className="flex gap-6 animate-marquee whitespace-nowrap px-6">
                  {[...GARF_BUZZ, ...GARF_BUZZ, ...GARF_BUZZ].map((item, i) => (
                    <div key={i} className="flex-shrink-0 bg-[#0b1120] border border-slate-800 rounded-2xl p-4 flex flex-col gap-2 min-w-[280px] hover:border-emerald-500 transition-all shadow-xl group">
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

             {/* Filter & Sort Controls - Strategic Deployment Filters */}
             <section className="px-4 md:px-6">
                <div className="bg-[#0b1120]/40 backdrop-blur-xl border border-slate-800 rounded-[32px] p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                   <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto p-1">
                      {[
                        { id: 'ALL', label: 'All Arenas' },
                        { id: 'TURF', label: 'Only Turfs' },
                        { id: 'GAMING CAFE', label: 'Only Cafes' }
                      ].map((type) => (
                        <button 
                          key={type.id}
                          onClick={() => setFilterType(type.id as any)}
                          className={`flex-shrink-0 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${filterType === type.id ? 'bg-emerald-500 border-emerald-400 text-black shadow-lg shadow-emerald-500/20' : 'bg-slate-900/50 text-slate-500 hover:text-white border-slate-800'}`}
                        >
                          {type.label}
                        </button>
                      ))}
                   </div>

                   <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto p-1 items-center">
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mr-2 hidden md:block">Tactical Sort</span>
                      {[
                        { id: 'RATING', label: 'Top Intel' },
                        { id: 'PRICE_LOW', label: 'Credits: Low' },
                        { id: 'PRICE_HIGH', label: 'Credits: High' }
                      ].map((sort) => (
                        <button 
                          key={sort.id}
                          onClick={() => setSortBy(sort.id as any)}
                          className={`flex-shrink-0 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${sortBy === sort.id ? 'bg-white border-white text-black' : 'bg-slate-900/50 text-slate-500 hover:text-white border-slate-800'}`}
                        >
                          {sort.label}
                        </button>
                      ))}
                   </div>
                </div>
             </section>

            {processedHubs.length > 0 ? (
              <section className="px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20 mt-4">
                {processedHubs.map(h => (
                  <div key={h.id} onClick={() => onHubSelect(h)} className="bg-[#0b1120] border border-slate-800 rounded-[40px] overflow-hidden group hover:-translate-y-2 transition-all cursor-pointer">
                    <div className="relative">
                      <img src={h.images[0]} className="h-52 w-full object-cover group-hover:scale-105 transition-transform" alt="" />
                      <div className="absolute top-4 left-4 bg-[#020617]/80 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-700/50 text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                        {h.type}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-black text-white uppercase truncate">{h.name}</h4>
                        <div className="bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 text-[10px] font-black flex items-center gap-1">
                          {h.rating} <StarIcon className="w-2.5 h-2.5 text-yellow-500" />
                        </div>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-6 flex items-center gap-1"><MapPinIcon className="w-3 h-3"/> {h.location}</p>
                      <div className="flex justify-between items-center pt-6 border-t border-slate-800/50">
                        <div><p className="text-[8px] font-black text-slate-600 uppercase">Starts At</p><p className="text-2xl font-black text-white">₹{h.priceStart}</p></div>
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-all">→</div>
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            ) : (
              <section className="px-4 md:px-6 py-20 text-center animate-pulse">
                <div className="max-w-md mx-auto p-12 bg-[#0b1120]/50 border border-slate-800 rounded-[60px] border-dashed">
                  <h3 className="text-2xl font-black text-slate-500 uppercase tracking-tighter">Arena Quiet</h3>
                  <p className="text-slate-600 font-black text-[10px] uppercase tracking-widest mt-2 leading-relaxed">No units detected on this frequency.</p>
                </div>
              </section>
            )}
          </div>
        )}

        {activeTab === 'community' && (
          <section className="px-4 md:px-6 flex flex-col flex-1 h-[70vh] md:grid md:grid-cols-[280px_1fr] gap-6 overflow-hidden">
            <aside className="bg-[#0b1120] border border-slate-800 rounded-[32px] p-4 flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar shadow-xl">
              {chatRooms.map(r => (
                <button key={r.id} onClick={() => setActiveRoomId(r.id)} className={`flex-shrink-0 w-[180px] md:w-full p-4 rounded-[20px] text-left border transition-all ${activeRoomId === r.id ? 'bg-emerald-500 border-emerald-400 text-black' : 'bg-[#020617] border-slate-800 text-slate-400 hover:border-slate-600'}`}>
                  <p className="text-[10px] font-black uppercase truncate">{r.name}</p>
                  <p className="text-[8px] font-bold uppercase opacity-60">{r.isGlobal ? 'Arena' : 'Squad'}</p>
                  {r.joinCode && <p className="text-[8px] font-black text-slate-600 mt-1">CODE: {r.joinCode}</p>}
                </button>
              ))}
              <button onClick={() => setShowSquadModal(true)} className="flex-shrink-0 px-4 py-3 md:mt-auto border border-dashed border-slate-700 rounded-xl text-[9px] font-black text-emerald-500 uppercase transition-colors hover:bg-emerald-500/10">+ New Squad</button>
            </aside>

            <div className="flex-1 bg-[#0b1120] border border-slate-800 rounded-[32px] flex flex-col overflow-hidden relative">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#020617]/40 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl bg-emerald-500 text-black uppercase">{activeRoom?.name.charAt(0)}</div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase">{activeRoom?.name}</h3>
                    <p className="text-[9px] text-slate-500 font-bold uppercase">{activeRoom?.description}</p>
                  </div>
                </div>
                <button onClick={() => setShowPollCreator(true)} className="bg-purple-600/10 text-purple-400 border border-purple-500/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all">Tactical Poll</button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                {activeRoom?.messages.map((m) => (
                  <div key={m.id} className={`flex flex-col ${m.senderNickname === nickname ? 'items-end' : 'items-start'} ${m.isSystem ? 'items-center' : ''}`}>
                    {!m.isSystem && <p className="text-[8px] font-black text-slate-600 uppercase mb-1 px-2">{m.senderNickname}</p>}
                    
                    {m.type === 'poll' && m.poll ? (
                      <div className="bg-slate-800 rounded-[28px] p-6 border border-slate-700 w-full max-w-sm space-y-4">
                        <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Tactical Poll</p>
                        <h4 className="text-white font-black uppercase">{m.poll.question}</h4>
                        <div className="space-y-2">
                           {m.poll.options.map((opt, idx) => (
                             <button key={idx} onClick={() => onVotePoll(activeRoomId, m.id, idx)} className="w-full bg-[#020617] border border-slate-700 rounded-xl p-3 text-left transition-all hover:border-emerald-500 group">
                               <div className="flex justify-between items-center mb-1">
                                 <span className="text-[10px] font-bold text-slate-300 uppercase">{opt.text}</span>
                                 <span className="text-[10px] font-black text-emerald-500">{opt.votes.length} Votes</span>
                               </div>
                               <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-emerald-500 h-full transition-all duration-700" style={{ width: `${(opt.votes.length / Math.max(1, m.poll?.options.reduce((a, b) => a + b.votes.length, 0) || 1)) * 100}%` }}></div>
                               </div>
                             </button>
                           ))}
                        </div>
                      </div>
                    ) : (
                      <div className={`max-w-[80%] px-5 py-3 rounded-[24px] text-sm font-medium ${(m.senderNickname === nickname ? 'bg-emerald-500 text-black rounded-tr-none' : 'bg-slate-800 text-white rounded-tl-none')}`}>
                        {m.text}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendText} className="p-6 bg-[#020617]/60 border-t border-slate-800 flex gap-3 backdrop-blur-3xl">
                <input type="text" placeholder="Enter comms..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="flex-1 bg-[#0b1120] border border-slate-800 rounded-2xl py-4 px-6 outline-none focus:border-emerald-500 text-sm font-bold" />
                <button type="submit" className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-black">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </form>
            </div>
          </section>
        )}

        {activeTab === 'history' && (
          <section className="px-4 py-12 max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl font-black uppercase mb-12">Mission Log</h2>
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl"><p className="text-slate-600 font-black uppercase">No operations found</p></div>
              ) : (
                bookings.map(b => (
                  <div key={b.id} className="bg-[#0b1120] border border-slate-800 p-6 rounded-[32px] flex justify-between items-center transition-all hover:border-emerald-500/30">
                    <div><h4 className="text-xl font-black uppercase">{b.hubName}</h4><p className="text-xs text-slate-500 font-bold uppercase">{b.slotTime}</p></div>
                    <div className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase ${b.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{b.status}</div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </main>

      {/* MODALS (Squad, Poll Creator) remains the same */}
      {showSquadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#020617]/90 backdrop-blur-2xl">
          <div className="bg-[#0b1120] border border-slate-800 rounded-[48px] p-10 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-8">
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Tactical Squad</h3>
              <button onClick={() => setShowSquadModal(false)} className="text-slate-500 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="flex gap-2 p-1 bg-[#020617] rounded-2xl border border-slate-800 mb-8">
              <button onClick={() => setSquadModalTab('create')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${squadModalTab === 'create' ? 'bg-[#10b981] text-black' : 'text-slate-500'}`}>Create Frequency</button>
              <button onClick={() => setSquadModalTab('join')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${squadModalTab === 'join' ? 'bg-[#10b981] text-black' : 'text-slate-500'}`}>Join Frequency</button>
            </div>

            {squadModalTab === 'create' ? (
              <form onSubmit={handleCreateSquadSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Frequency Name</label>
                  <input type="text" value={squadNameInput} onChange={(e) => setSquadNameInput(e.target.value)} placeholder="Elite Comms..." className="w-full bg-[#020617] border border-slate-800 rounded-2xl py-4 px-6 outline-none focus:border-emerald-500 text-white font-bold" />
                </div>
                {joinError && <p className="text-red-500 text-[10px] font-bold uppercase">{joinError}</p>}
                <button type="submit" className="w-full py-5 bg-emerald-500 text-black font-black rounded-2xl uppercase tracking-widest hover:scale-[1.02] transition-all">Initialize</button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase">4-Digit Frequency Code</label>
                  <input type="text" maxLength={4} value={joinCodeInput} onChange={(e) => setJoinCodeInput(e.target.value.replace(/\D/g,''))} placeholder="0000" className="w-full bg-[#020617] border border-slate-800 rounded-2xl py-4 px-6 outline-none focus:border-emerald-500 text-white font-black text-3xl text-center tracking-[0.5em]" />
                </div>
                {joinError && <p className="text-red-500 text-[10px] font-bold uppercase">{joinError}</p>}
                <button onClick={handleJoinSquadSubmit} className="w-full py-5 bg-emerald-500 text-black font-black rounded-2xl uppercase tracking-widest hover:scale-[1.02] transition-all">Synchronize</button>
              </div>
            )}
          </div>
        </div>
      )}

      {showPollCreator && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#020617]/90 backdrop-blur-2xl">
          <div className="bg-[#0b1120] border border-slate-800 rounded-[48px] p-10 w-full max-w-xl shadow-2xl animate-in fade-in zoom-in duration-300">
             <div className="flex justify-between items-start mb-8">
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Tactical Poll</h3>
              <button onClick={() => setShowPollCreator(false)} className="text-slate-500 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleCreatePollSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase">Question</label>
                <input type="text" value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} placeholder="Pick our drop zone?" className="w-full bg-[#020617] border border-slate-800 rounded-2xl py-4 px-6 outline-none focus:border-purple-500 text-white font-bold" />
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                   <label className="text-[10px] font-black text-slate-500 uppercase">Tactical Options</label>
                   <button type="button" onClick={addPollOption} className="text-purple-400 text-[10px] font-black uppercase hover:text-purple-300 transition-all">+ Add Option</button>
                 </div>
                 <div className="space-y-3 max-h-[200px] overflow-y-auto no-scrollbar">
                    {pollOptions.map((opt, idx) => (
                      <input key={idx} type="text" value={opt} onChange={(e) => updatePollOption(idx, e.target.value)} placeholder={`Option ${idx + 1}`} className="w-full bg-[#020617] border border-slate-800 rounded-xl py-3 px-5 outline-none focus:border-purple-500 text-sm font-bold text-white" />
                    ))}
                 </div>
              </div>

              <button type="submit" className="w-full py-5 bg-purple-600 text-white font-black rounded-2xl uppercase tracking-widest hover:scale-[1.02] transition-all shadow-[0_8px_32px_rgba(147,51,234,0.3)]">Deploy Poll</button>
            </form>
          </div>
        </div>
      )}

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
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default UserDashboard;