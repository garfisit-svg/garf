import React, { useState, useEffect } from 'react';
import { Hub, UserRole, TimeSlot, Accessory, Booking, Review } from '../types';
import Navbar from '../components/Navbar';
import { StarIcon } from '../components/Icons';

interface HubDetailViewProps {
  hub: Hub;
  role: UserRole;
  onBack: () => void;
  onLogout: () => void;
  onBook: (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status' | 'userId' | 'userName'>) => void;
  onPostReview: (hubId: string, review: Omit<Review, 'id' | 'date'>) => void;
}

const HubDetailView: React.FC<HubDetailViewProps> = ({ hub, role, onBack, onLogout, onBook, onPostReview }) => {
  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(hub.accessories && hub.accessories.length > 0 ? hub.accessories[0] : null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [playerCount, setPlayerCount] = useState<number>(5);
  const [showSummary, setShowSummary] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash' | 'upi' | null>(null);
  const [isBooked, setIsBooked] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [paymentStep, setPaymentStep] = useState<'select' | 'qr' | 'verifying'>('select');

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isPostingReview, setIsPostingReview] = useState(false);

  const handleConfirmOrder = () => {
    setShowSummary(true);
    setPaymentStep('select');
  };

  const handleFinalBooking = () => {
    if (paymentMethod && selectedSlot) {
      onBook({
        hubId: hub.id,
        hubName: hub.name,
        slotId: selectedSlot.id,
        slotTime: selectedSlot.time,
        date: new Date().toISOString().split('T')[0],
        paymentMethod,
        accessoryName: selectedAccessory?.name,
        playerCount: hub.type === 'TURF' ? playerCount : undefined,
        perPersonShare: hub.type === 'TURF' ? Math.round(selectedSlot.price / playerCount) : undefined
      });
      setIsBooked(true);
      setTimeout(() => {
        onBack();
      }, 3000);
    }
  };

  const simulateUPI = () => {
    setPaymentStep('verifying');
    setTimeout(() => {
      handleFinalBooking();
    }, 2500);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewComment.trim() === '') return;
    setIsPostingReview(true);
    setTimeout(() => {
      onPostReview(hub.id, {
        userName: 'Current User',
        rating: reviewRating,
        comment: reviewComment
      });
      setReviewComment('');
      setReviewRating(5);
      setIsPostingReview(false);
    }, 800);
  };

  const displaySlots = hub.type === 'TURF' ? hub.slots : (selectedAccessory?.slots || []);

  return (
    <div className="min-h-screen bg-[#020617] relative pb-20">
      <Navbar role={role} onLogout={onLogout} onNavigateHome={onBack} />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-colors font-bold uppercase tracking-widest text-xs">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Browse
        </button>

        <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
          <div className="space-y-12">
            <section className="space-y-4">
              <div className="relative aspect-[16/9] w-full rounded-[48px] overflow-hidden border border-slate-800 shadow-2xl">
                <img src={hub.images[activeImageIdx]} className="w-full h-full object-cover transition-all duration-700" alt={hub.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-8 left-8">
                   <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10">
                      <StarIcon className="w-4 h-4 text-yellow-400" />
                      <span className="text-xl font-black text-white">{hub.rating}</span>
                   </div>
                </div>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {hub.images.map((img, idx) => (
                  <button key={idx} onClick={() => setActiveImageIdx(idx)} className={`flex-shrink-0 w-32 h-20 rounded-2xl overflow-hidden border-2 transition-all ${activeImageIdx === idx ? 'border-emerald-500 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'}`}>
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            </section>

            <div className="bg-[#0b1120] border border-slate-800 rounded-[40px] p-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center"><span className="text-white font-black text-xs uppercase">{hub.type === 'TURF' ? 'Turf' : 'Gear'}</span></div>
                <h1 className="text-5xl font-black text-white tracking-tighter uppercase">{hub.name}</h1>
              </div>
              <p className="text-slate-400 text-xl leading-relaxed mb-10 max-w-3xl">{hub.description}</p>

              {hub.type === 'TURF' && (
                <div className="mb-12">
                   <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/20 mb-6 inline-flex"><span className="text-[10px] font-black uppercase tracking-widest">01</span><span className="font-black uppercase">Number of Players</span></div>
                   <div className="flex items-center gap-6 bg-[#020617] border border-slate-800 rounded-3xl p-6">
                      <input type="range" min="1" max="22" value={playerCount} onChange={(e) => setPlayerCount(parseInt(e.target.value))} className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#10b981]" />
                      <div className="w-20 h-14 bg-[#0b1120] border border-slate-800 rounded-2xl flex items-center justify-center"><span className="text-2xl font-black text-[#10b981]">{playerCount}</span></div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest max-w-[80px]">Total Athletes</p>
                   </div>
                </div>
              )}

              {hub.type === 'GAMING CAFE' && hub.accessories && (
                <div className="mb-12">
                  <div className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-xl border border-blue-500/20 mb-6 inline-flex"><span className="text-[10px] font-black uppercase tracking-widest">01</span><span className="font-black uppercase">Select Gear Unit</span></div>
                  <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {hub.accessories.map((acc) => (
                      <button key={acc.id} onClick={() => { setSelectedAccessory(acc); setSelectedSlot(null); }} className={`flex-shrink-0 px-8 py-5 rounded-3xl border transition-all ${selectedAccessory?.id === acc.id ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' : 'bg-[#020617] border-slate-800 text-slate-500 hover:border-slate-600'}`}>
                        <p className="text-xs font-black uppercase tracking-widest mb-1">Unit</p>
                        <p className="text-xl font-black">{acc.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/20 mb-8 inline-flex"><span className="text-[10px] font-black uppercase tracking-widest">02</span><span className="font-black uppercase">Pick Session Time</span></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displaySlots.length > 0 ? displaySlots.map((slot) => (
                  <button key={slot.id} disabled={!slot.available} onClick={() => setSelectedSlot(slot)} className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-1 relative overflow-hidden ${!slot.available ? 'bg-slate-900 border-slate-800 opacity-40 cursor-not-allowed' : selectedSlot?.id === slot.id ? 'bg-emerald-500 border-emerald-400 text-[#020617] shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-[#020617] border-slate-800 text-white hover:border-slate-600'}`}>
                    {!slot.available && <div className="absolute top-2 right-2 bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest">Booked</div>}
                    <span className="text-2xl font-black">{slot.time}</span>
                    <div className="flex items-center gap-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${selectedSlot?.id === slot.id ? 'text-[#020617]/70' : 'text-slate-500'}`}>Price</span>
                      <span className={`text-sm font-black ${selectedSlot?.id === slot.id ? 'text-[#020617]' : 'text-emerald-400'}`}>₹{slot.price}</span>
                    </div>
                  </button>
                )) : (
                  <div className="col-span-full py-12 text-center bg-[#020617] border border-dashed border-slate-800 rounded-3xl"><p className="text-slate-600 font-black uppercase tracking-widest">No slots available for this selection</p></div>
                )}
              </div>
            </div>
          </div>

          <aside className="sticky top-28 space-y-6">
            <div className="bg-[#0b1120] border border-slate-800 rounded-[40px] p-10 shadow-2xl">
              <h3 className="text-3xl font-black text-white mb-8 tracking-tighter uppercase">Checkout</h3>
              <div className="bg-[#020617] border border-dashed border-slate-800 rounded-3xl min-h-[240px] flex flex-col items-center justify-center p-8 text-center mb-8">
                {selectedSlot ? (
                  <div className="w-full space-y-6 text-left">
                     <div className="flex justify-between items-center"><span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Hub</span><span className="text-white font-black truncate max-w-[150px]">{hub.name}</span></div>
                     {hub.type === 'GAMING CAFE' && selectedAccessory && (<div className="flex justify-between items-center"><span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Unit</span><span className="text-blue-400 font-black">{selectedAccessory.name}</span></div>)}
                     <div className="flex justify-between items-center"><span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Session</span><span className="text-white font-black">{selectedSlot.time}</span></div>
                     {hub.type === 'TURF' && (<div className="flex justify-between items-center"><span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Team Size</span><span className="text-white font-black">{playerCount} Players</span></div>)}
                     <div className="h-px bg-slate-800"></div>
                     {hub.type === 'TURF' && (
                       <div className="flex justify-between items-center p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/20">
                          <span className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.2em]">Split Share</span>
                          <span className="text-xl font-black text-emerald-400">₹{Math.round(selectedSlot.price / playerCount)} <span className="text-[10px] opacity-60">/person</span></span>
                       </div>
                     )}
                     <div className="flex justify-between items-center"><span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Total Bill</span><span className="text-3xl font-black text-white">₹{selectedSlot.price}</span></div>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-4"><svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                    <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Complete selection to proceed</p>
                  </>
                )}
              </div>
              <button disabled={!selectedSlot} onClick={handleConfirmOrder} className={`w-full py-5 rounded-2xl font-black text-lg transition-all uppercase tracking-widest ${selectedSlot ? 'bg-emerald-500 text-[#020617] hover:bg-emerald-400 shadow-[0_8px_30px_rgba(16,185,129,0.3)]' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>Book Session</button>
            </div>
          </aside>
        </div>
      </main>

      {showSummary && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#020617]/90 backdrop-blur-md">
          <div className="bg-[#0b1120] border border-slate-800 rounded-[48px] p-10 w-full max-w-xl shadow-2xl overflow-hidden relative">
            
            {/* Payment Verification Overlay */}
            {paymentStep === 'verifying' && (
              <div className="absolute inset-0 z-50 bg-[#0b1120] flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-300">
                <div className="w-24 h-24 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-8"></div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Verifying Payment</h3>
                <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">Synchronizing with banking satellite...</p>
              </div>
            )}

            {!isBooked ? (
              <>
                <div className="flex justify-between items-start mb-10">
                  <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Tactical Checkout</h3>
                  <button onClick={() => { setShowSummary(false); setPaymentMethod(null); setPaymentStep('select'); }} className="p-2 text-slate-500 hover:text-white transition-colors"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>

                {paymentStep === 'select' && (
                  <div className="animate-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-4 mb-10 bg-[#020617] p-8 rounded-3xl border border-slate-800/50">
                      <div className="flex justify-between pb-4 border-b border-slate-800/30"><span className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Venue</span><span className="text-white font-black">{hub.name}</span></div>
                      <div className="flex justify-between pt-4"><span className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Payable</span><span className="text-3xl font-black text-emerald-400">₹{selectedSlot?.price}</span></div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Select Payment Gateway</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <button onClick={() => { setPaymentMethod('upi'); setPaymentStep('qr'); }} className="py-6 px-4 rounded-3xl border bg-purple-600/10 border-purple-500/20 text-purple-400 hover:bg-purple-600 hover:text-white transition-all font-black text-xs uppercase tracking-widest flex flex-col items-center gap-2">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                          UPI / QR
                        </button>
                        <button onClick={() => { setPaymentMethod('online'); handleFinalBooking(); }} className="py-6 px-4 rounded-3xl border bg-emerald-600/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all font-black text-xs uppercase tracking-widest flex flex-col items-center gap-2">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                          Card
                        </button>
                        <button onClick={() => { setPaymentMethod('cash'); handleFinalBooking(); }} className="py-6 px-4 rounded-3xl border bg-yellow-600/10 border-yellow-500/20 text-yellow-500 hover:bg-yellow-600 hover:text-white transition-all font-black text-xs uppercase tracking-widest flex flex-col items-center gap-2">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                          Cash
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {paymentStep === 'qr' && (
                  <div className="animate-in zoom-in duration-500 text-center">
                    <div className="relative mx-auto w-64 h-64 mb-8 bg-white p-4 rounded-[40px] border-4 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=garf@upi&am=${selectedSlot?.price}&pn=GarfArena`} className="w-full h-full object-contain" alt="Payment QR" />
                      <div className="absolute inset-x-0 top-0 h-1 bg-purple-500 animate-[scan_2s_infinite] opacity-50"></div>
                    </div>
                    <p className="text-xl font-black text-white uppercase tracking-tighter mb-2">Scan & Pay ₹{selectedSlot?.price}</p>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-10">Use any UPI app (GPay, PhonePe, Paytm)</p>
                    <div className="flex gap-4">
                      <button onClick={() => setPaymentStep('select')} className="flex-1 py-4 bg-slate-800 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest">Back</button>
                      <button onClick={simulateUPI} className="flex-[2] py-4 bg-purple-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-lg shadow-purple-600/20">Payment Completed</button>
                    </div>
                  </div>
                )}
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
      <style>{`
        @keyframes scan {
          0% { top: 10%; }
          50% { top: 90%; }
          100% { top: 10%; }
        }
      `}</style>
    </div>
  );
};

export default HubDetailView;