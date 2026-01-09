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
  
  const [activeRoomId, setActiveRoomId] = useState<string>('global');
  const [chatInput, setChatInput] = useState('');
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [showSquadModal, setShowSquadModal] = useState(false);
  const [squadNameInput, setSquadNameInput] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [squadModalTab, setSquadModalTab] = useState<'create' | 'join'>('create');

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeRoomId, chatRooms]);

  const topRatedHubs = hubs.filter(h => h.rating >= 4.7 && !h.isSoldOut).sort((a, b) => b.rating - a.rating);
  const activeRoom = chatRooms.find(r => r.id === activeRoomId);

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(activeRoomId, { text: chatInput, type: 'text' });
    setChatInput('');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col overflow-x-hidden">
      <Navbar role="user" onLogout={onLogout} onNavigateHome={onNavigateHome} />

      <main className="max-w-[1600px] w-full mx-auto py-4 md:py-8 flex-1 flex flex-col">
        {/* Tabs */}
        <div className="px-4 md:px-6 mb-8 flex justify-center overflow-x-auto no-scrollbar shrink-0">
          <div className="bg-[#0b1120] border border-slate-800 rounded-[28px] p-1.5 flex gap-1 shadow-2xl shrink-0">
            {['explore', 'community', 'history'].map((t) => (
              <button key={t} onClick={() => setActiveTab(t as any)} className={`px-6 md:px-10 py-3 md:py-4 rounded-[22px] font-black text-[11px] md:text-[13px] uppercase tracking-widest transition-all ${activeTab === t ? 'bg-[#10b981] text-[#020617] shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}>{t}</button>
            ))}
          </div>
        </div>

        {activeTab === 'explore' && (
          <div className="space-y-12 animate-in fade-in duration-700">
             {/* Hero with Tagline */}
             <section className="px-4 md:px-6">
              <div className="relative w-full rounded-[40px] md:rounded-[60px] overflow-hidden min-h-[400px] flex flex-col items-center justify-center text-center p-8 border border-slate-800/30">
                <div className="absolute inset-0 z-0">
                  <img src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover brightness-[0.05]" alt="" />
                </div>
                <div className="relative z-10 space-y-6 max-w-4xl">
                  <h1 className="text-4xl md:text-7xl font-black text-white leading-none uppercase tracking-tighter">DOMINATE THE<br/><span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent italic">DIGITAL & DIRT</span></h1>
                  <p className="text-slate-400 text-xs md:text-sm font-black uppercase tracking-widest opacity-80">Real-time bookings for elite sports turfs and next-gen gaming cafes.</p>
                  <div className="relative w-full max-w-2xl mx-auto mt-4">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2"><SearchIcon className="w-5 h-5 text-emerald-400" /></div>
                    <input type="text" placeholder="Search elite hubs..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#0b1120]/60 backdrop-blur-3xl border border-slate-700/50 rounded-[28px] py-4 pl-16 pr-6 text-white focus:border-emerald-500 outline-none text-sm font-bold shadow-2xl" />
                  </div>
                </div>
              </div>
            </section>

            {/* Marquees */}
            <div className="space-y-10">
              <section className="overflow-hidden">
                <div className="flex gap-6 animate-marquee-fast">
                  {[...topRatedHubs, ...topRatedHubs].map((h, i) => (
                    <div key={i} onClick={() => onHubSelect(h)} className="flex-shrink-0 w-[300px] bg-[#0b1120] border border-slate-800 rounded-3xl overflow-hidden cursor-pointer hover:border-emerald-500 transition-all">
                      <img src={h.images[0]} className="h-40 w-full object-cover" alt="" />
                      <div className="p-4"><h4 className="font-black text-white uppercase text-sm truncate">{h.name}</h4><p className="text-[10px] text-slate-500 font-bold">{h.location}</p></div>
                    </div>
                  ))}
                </div>
              </section>
              <section className="overflow-hidden">
                <div className="flex gap-4 animate-marquee">
                  {[...GARF_BUZZ, ...GARF_BUZZ].map((b, i) => (
                    <div key={i} className="flex-shrink-0 bg-[#0b1120]/50 border border-slate-800 rounded-2xl p-4 w-[250px]">
                      <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded mb-1 inline-block">{b.tag}</span>
                      <h4 className="text-xs font-black text-white uppercase truncate">{b.title}</h4>
                      <p className="text-[10px] text-slate-500 truncate">{b.content}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Hub Grid */}
            <section className="px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
              {hubs.filter(h => h.name.toLowerCase().includes(search.toLowerCase())).map(h => (
                <div key={h.id} onClick={() => onHubSelect(h)} className="bg-[#0b1120] border border-slate-800 rounded-[40px] overflow-hidden group hover:-translate-y-2 transition-all cursor-pointer">
                  <img src={h.images[0]} className="h-52 w-full object-cover group-hover:scale-105 transition-transform" alt="" />
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2"><h4 className="text-lg font-black text-white uppercase truncate">{h.name}</h4><div className="bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 text-[10px] font-black">{h.rating} ★</div></div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-6">{h.location}</p>
                    <div className="flex justify-between items-center pt-6 border-t border-slate-800/50">
                      <div><p className="text-[8px] font-black text-slate-600 uppercase">Starts At</p><p className="text-2xl font-black text-white">₹{h.priceStart}</p></div>
                      <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-all">→</div>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}

        {activeTab === 'community' && (
          <section className="px-4 md:px-6 flex flex-col flex-1 h-[70vh] md:grid md:grid-cols-[280px_1fr] gap-6 overflow-hidden">
            <aside className="bg-[#0b1120] border border-slate-800 rounded-[32px] p-4 flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar shadow-xl">
              {chatRooms.map(r => (
                <button key={r.id} onClick={() => setActiveRoomId(r.id)} className={`flex-shrink-0 w-[180px] md:w-full p-4 rounded-[20px] text-left border transition-all ${activeRoomId === r.id ? (r.id === 'ai-scout' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-emerald-500 border-emerald-400 text-black') : 'bg-[#020617] border-slate-800 text-slate-400 hover:border-slate-600'}`}>
                  <p className="text-[10px] font-black uppercase truncate">{r.name}</p>
                  <p className="text-[8px] font-bold uppercase opacity-60">{r.id === 'ai-scout' ? 'Active Intel' : (r.isGlobal ? 'Arena' : 'Squad')}</p>
                </button>
              ))}
              <button onClick={() => setShowSquadModal(true)} className="flex-shrink-0 px-4 py-3 md:mt-auto border border-dashed border-slate-700 rounded-xl text-[9px] font-black text-emerald-500 uppercase">+ New Squad</button>
            </aside>

            <div className="flex-1 bg-[#0b1120] border border-slate-800 rounded-[32px] flex flex-col overflow-hidden relative">
              {/* Chat Header */}
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#020617]/40 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${activeRoomId === 'ai-scout' ? 'bg-blue-600' : 'bg-emerald-500 text-black'}`}>{activeRoom?.name.charAt(0)}</div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase">{activeRoom?.name}</h3>
                    <p className="text-[9px] text-slate-500 font-bold uppercase">{activeRoom?.description}</p>
                  </div>
                </div>
                {activeRoomId !== 'ai-scout' && <button onClick={() => setShowPollCreator(true)} className="bg-purple-600/10 text-purple-400 border border-purple-500/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Tactical Poll</button>}
              </div>

              {/* Message Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                {activeRoom?.messages.map((m) => (
                  <div key={m.id} className={`flex flex-col ${m.senderNickname === nickname ? 'items-end' : 'items-start'} ${m.isSystem ? 'items-center' : ''}`}>
                    {!m.isSystem && <p className="text-[8px] font-black text-slate-600 uppercase mb-1 px-2">{m.senderNickname}</p>}
                    {m.isSystem ? (
                      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg px-4 py-1 text-[8px] font-black text-emerald-500 uppercase italic">{m.text}</div>
                    ) : (
                      <div className={`max-w-[80%] px-5 py-3 rounded-[24px] text-sm font-medium ${m.senderNickname === 'AI_SCOUT' ? 'bg-blue-900/40 border border-blue-500/30 text-blue-100 rounded-tl-none font-mono text-xs' : (m.senderNickname === nickname ? 'bg-emerald-500 text-black rounded-tr-none' : 'bg-slate-800 text-white rounded-tl-none')}`}>
                        {m.senderNickname === 'AI_SCOUT' && <span className="text-blue-400 font-black block mb-1">INTEL RECEIVED:</span>}
                        {m.text}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendText} className="p-6 bg-[#020617]/60 border-t border-slate-800 flex gap-3 backdrop-blur-3xl">
                <input type="text" placeholder={activeRoomId === 'ai-scout' ? "Request hub intel..." : "Enter comms..."} value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="flex-1 bg-[#0b1120] border border-slate-800 rounded-2xl py-4 px-6 outline-none focus:border-emerald-500 text-sm font-bold" />
                <button type="submit" className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-black shadow-lg hover:scale-105 transition-all">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </form>
            </div>
          </section>
        )}
        
        {activeTab === 'history' && (
          <section className="px-4 py-12 max-w-4xl mx-auto">
            <h2 className="text-4xl font-black uppercase mb-12">Mission Log</h2>
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl"><p className="text-slate-600 font-black uppercase">No operations found</p></div>
              ) : (
                bookings.map(b => (
                  <div key={b.id} className="bg-[#0b1120] border border-slate-800 p-6 rounded-[32px] flex justify-between items-center">
                    <div><h4 className="text-xl font-black uppercase">{b.hubName}</h4><p className="text-xs text-slate-500 font-bold uppercase">{b.slotTime}</p></div>
                    <div className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase ${b.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{b.status}</div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </main>

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 35s linear infinite; width: max-content; display: flex; }
        .animate-marquee-fast { animation: marquee 20s linear infinite; width: max-content; display: flex; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default UserDashboard;
