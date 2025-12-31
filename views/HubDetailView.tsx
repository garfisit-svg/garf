
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
  const [showSummary, setShowSummary] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash' | null>(null);
  const [isBooked, setIsBooked] = useState(false);

  const handleConfirmOrder = () => {
    setShowSummary(true);
  };

  const handleFinalBooking = () => {
    if (paymentMethod) {
      setIsBooked(true);
      setTimeout(() => {
        onBack();
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] relative">
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
                    <span className="font-black uppercase">Session Pick</span>
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

          <aside className="sticky top-28 space-y-6">
            <div className="bg-[#0b1120] border border-slate-800 rounded-[40px] p-10 shadow-2xl">
              <h3 className="text-3xl font-black text-white mb-8 tracking-tighter uppercase">Checkout</h3>
              
              <div className="bg-[#020617] border border-dashed border-slate-800 rounded-3xl h-[240px] flex flex-col items-center justify-center p-8 text-center">
                {selectedSlot ? (
                  <div className="w-full">
                     <div className="flex justify-between items-center mb-6">
                        <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Venue</span>
                        <span className="text-white font-black truncate max-w-[150px]">{hub.name}</span>
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
                    <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Select a slot to proceed</p>
                  </>
                )}
              </div>

              <button 
                disabled={!selectedSlot}
                onClick={handleConfirmOrder}
                className={`w-full py-5 rounded-2xl font-black text-lg transition-all mt-8 ${
                  selectedSlot 
                    ? 'bg-emerald-500 text-[#020617] hover:bg-emerald-400 shadow-[0_8px_30px_rgba(16,185,129,0.3)]' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Confirm Order
              </button>
            </div>
          </aside>
        </div>
      </main>

      {showSummary && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#020617]/90 backdrop-blur-md">
          <div className="bg-[#0b1120] border border-slate-800 rounded-[48px] p-10 w-full max-w-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-300">
            {!isBooked ? (
              <>
                <div className="flex justify-between items-start mb-10">
                  <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Summary</h3>
                  <button onClick={() => { setShowSummary(false); setPaymentMethod(null); }} className="p-2 text-slate-500 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4 mb-10 bg-[#020617] p-8 rounded-3xl border border-slate-800/50">
                  <div className="flex justify-between pb-4 border-b border-slate-800/30">
                    <span className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Venue</span>
                    <span className="text-white font-black">{hub.name}</span>
                  </div>
                  <div className="flex justify-between pb-4 border-b border-slate-800/30">
                    <span className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Time Slot</span>
                    <span className="text-white font-black">{selectedSlot?.time}</span>
                  </div>
                  <div className="flex justify-between pt-4">
                    <span className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Payable</span>
                    <span className="text-3xl font-black text-emerald-400">₹{selectedSlot?.price}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-10">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Select Payment Mode</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setPaymentMethod('online')} className={`py-6 px-4 rounded-3xl border transition-all font-black text-xs uppercase tracking-widest ${paymentMethod === 'online' ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-[#020617] border-slate-800 text-slate-500 hover:border-slate-600'}`}>
                      Online
                    </button>
                    <button onClick={() => setPaymentMethod('cash')} className={`py-6 px-4 rounded-3xl border transition-all font-black text-xs uppercase tracking-widest ${paymentMethod === 'cash' ? 'bg-yellow-600 border-yellow-400 text-white shadow-[0_0_20px_rgba(202,138,4,0.4)]' : 'bg-[#020617] border-slate-800 text-slate-500 hover:border-slate-600'}`}>
                      Cash
                    </button>
                  </div>
                </div>

                {paymentMethod === 'cash' && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-10 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex gap-4 items-center">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      </div>
                      <p className="text-xs font-bold text-red-400 leading-tight">
                        Arrive within 15 mins of your slot starting time otherwise released
                      </p>
                    </div>
                  </div>
                )}

                <button disabled={!paymentMethod} onClick={handleFinalBooking} className={`w-full py-6 rounded-3xl font-black text-lg transition-all uppercase tracking-[0.2em] ${paymentMethod ? 'bg-white text-black hover:scale-[1.02]' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}>
                  Book Session
                </button>
              </>
            ) : (
              <div className="text-center py-10 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(16,185,129,0.5)]">
                  <svg className="w-12 h-12 text-[#020617]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Slot Reserved</h3>
                <p className="text-slate-400 font-medium">Redirecting you to dashboard...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HubDetailView;
