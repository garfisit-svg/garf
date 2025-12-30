
import React, { useState } from 'react';
import { Hub, UserRole, TimeSlot } from '../types';
import Navbar from '../components/Navbar';
import { StarIcon } from '../components/Icons';

interface HubDetailViewProps {
  hub: Hub;
  role: UserRole;
  onBack: () => void;
  onLogout: () => void;
}

const HubDetailView: React.FC<HubDetailViewProps> = ({ hub, role, onBack, onLogout }) => {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  return (
    <div className="min-h-screen bg-[#020617]">
      <Navbar role={role} onLogout={onLogout} onNavigateHome={onBack} />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-colors font-bold uppercase tracking-widest text-xs"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Browse
        </button>

        <div className="grid lg:grid-cols-[1fr_400px] gap-10 items-start">
          <div className="space-y-8">
            {/* Header */}
            <div className="bg-[#0b1120] border border-slate-800 rounded-[40px] p-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center">
                   <span className="text-white font-black text-xs uppercase">Hub</span>
                </div>
                <h1 className="text-5xl font-black text-white tracking-tighter uppercase">{hub.name}</h1>
              </div>
              <p className="text-slate-400 text-xl leading-relaxed mb-10 max-w-2xl">
                {hub.description}
              </p>

              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/20">
                    <span className="text-[10px] font-black uppercase tracking-widest">01</span>
                    <span className="font-black">SESSION PICK</span>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                {hub.slots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-6 rounded-3xl border transition-all text-center flex flex-col items-center gap-1 ${
                      selectedSlot?.id === slot.id 
                        ? 'bg-emerald-500 border-emerald-400 text-[#020617] shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                        : 'bg-[#020617] border-slate-800 text-white hover:border-slate-600'
                    }`}
                  >
                    <span className="text-2xl font-black">{slot.time}</span>
                    <span className={`text-xs font-bold uppercase tracking-widest ${selectedSlot?.id === slot.id ? 'text-[#020617]/70' : 'text-slate-500'}`}>₹{slot.price}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Community Section */}
            <div className="bg-[#0b1120] border border-slate-800 rounded-[40px] p-10">
               <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                     <StarIcon className="w-6 h-6 text-yellow-400" />
                     <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Community Voice</h3>
                  </div>
                  <div className="text-right">
                     <p className="text-4xl font-black text-white">{hub.rating}</p>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aggregate Rating</p>
                  </div>
               </div>

               <div className="bg-[#020617] rounded-3xl p-8 border border-slate-800">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Rating Value</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <StarIcon key={i} className={`w-6 h-6 ${i <= Math.floor(hub.rating) ? 'text-yellow-400' : 'text-slate-700'}`} />
                    ))}
                  </div>
               </div>
            </div>
          </div>

          {/* Checkout Sidebar */}
          <aside className="sticky top-28 space-y-6">
            <div className="bg-[#0b1120] border border-slate-800 rounded-[40px] p-10">
              <h3 className="text-3xl font-black text-white mb-8 tracking-tighter uppercase">Checkout</h3>
              
              <div className="bg-[#020617] border border-dashed border-slate-800 rounded-3xl h-[240px] flex flex-col items-center justify-center p-8 text-center">
                {selectedSlot ? (
                  <div className="w-full">
                     <div className="flex justify-between items-center mb-6">
                        <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Hub</span>
                        <span className="text-white font-black">{hub.name}</span>
                     </div>
                     <div className="flex justify-between items-center mb-6">
                        <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Slot</span>
                        <span className="text-white font-black">{selectedSlot.time}</span>
                     </div>
                     <div className="h-px bg-slate-800 mb-6"></div>
                     <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Total</span>
                        <span className="text-3xl font-black text-emerald-400">₹{selectedSlot.price}</span>
                     </div>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                       <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                    </div>
                    <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Awaiting Parameter Selection</p>
                  </>
                )}
              </div>

              <button 
                disabled={!selectedSlot}
                className={`w-full py-5 rounded-2xl font-black text-lg transition-all mt-8 ${
                  selectedSlot 
                    ? 'bg-emerald-500 text-[#020617] hover:bg-emerald-400 shadow-[0_8px_30px_rgba(16,185,129,0.3)]' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Confirm Order
              </button>
            </div>

            <div className="bg-cyan-900/10 border border-cyan-500/20 rounded-[32px] p-6">
               <p className="text-cyan-400 text-xs font-bold leading-relaxed italic">
                 "Instant confirmation and digital entry key will be shared post successful payment."
               </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default HubDetailView;
