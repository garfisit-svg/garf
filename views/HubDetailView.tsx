import React, { useState } from 'react';
import { Hub, UserRole, TimeSlot, Accessory, Booking, Review } from '../types';
import Navbar from '../components/Navbar';
import { StarIcon } from '../components/Icons';

interface HubDetailViewProps {
  hub: Hub;
  role: UserRole;
  onBack: () => void;
  onLogout: () => void;
  onBook: (bookingData: any) => void;
  onPostReview: (hubId: string, review: Omit<Review, 'id' | 'date'>) => void;
  allBookings?: Booking[];
}

const HubDetailView: React.FC<HubDetailViewProps> = ({ hub, role, onBack, onLogout, onBook, allBookings = [] }) => {
  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(hub.type === 'GAMING CAFE' && hub.accessories ? hub.accessories[0] : null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [playerCount, setPlayerCount] = useState<number>(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeMenuPhoto, setActiveMenuPhoto] = useState<string | null>(null);

  // --- SERVICE FEE & SPLIT LOGIC ---
  const hubBookingCount = allBookings.filter(b => b.hubId === hub.id && b.status === 'confirmed').length;
  const serviceFee = hubBookingCount >= 50 ? 10 : 0;
  const basePrice = selectedSlot ? selectedSlot.price : 0;
  const totalPrice = basePrice + serviceFee;
  const splitShare = Math.ceil(totalPrice / playerCount);

  // --- DIRECT UPI LOGIC ---
  const bookingRef = selectedAccessory ? `${hub.name}-${selectedAccessory.name}` : hub.name;
  const upiLink = selectedSlot ? `upi://pay?pa=${hub.upiId}&pn=${encodeURIComponent(hub.name)}&am=${totalPrice}&cu=INR&tn=${encodeURIComponent('Garf Booking: ' + bookingRef)}` : '';
  const qrCodeUrl = selectedSlot ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}` : '';

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onBook({
        hubId: hub.id,
        hubName: hub.name,
        accessoryName: selectedAccessory?.name || 'Main Turf',
        slotTime: selectedSlot?.time,
        paymentMethod: 'upi',
        status: 'confirmed',
        basePrice: basePrice,
        serviceFee: serviceFee,
        totalPrice: totalPrice,
        playerCount: playerCount
      });
      setIsProcessing(false);
      setShowPaymentModal(false);
    }, 1500);
  };

  const currentSlots = hub.type === 'TURF' ? hub.slots : (selectedAccessory?.slots || []);

  return (
    <div className="min-h-screen bg-[#020617] pb-10 font-inter">
      <Navbar role={role} onLogout={onLogout} onNavigateHome={onBack} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <button onClick={onBack} className="text-slate-500 font-black text-[9px] uppercase tracking-[0.4em] mb-8 flex items-center gap-2 hover:text-white transition-colors group">
          <div className="w-7 h-7 rounded-full border border-slate-800 flex items-center justify-center group-hover:border-slate-500 transition-all">
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </div>
          BACK TO BROWSE
        </button>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8 xl:gap-16">
          <div className="space-y-8 md:space-y-12">
            <div className="relative aspect-video rounded-[30px] md:rounded-[60px] overflow-hidden border border-slate-800 shadow-2xl group">
              <img src={hub.images[0]} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105" alt={hub.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 pr-6">
                 <h1 className="text-3xl md:text-6xl font-black text-white uppercase tracking-tighter mb-2 md:mb-4 leading-none truncate">{hub.name}</h1>
                 <div className="flex items-center gap-3">
                    <span className="bg-emerald-500 text-[#020617] font-black px-3 py-1 rounded-lg text-[8px] md:text-[10px] uppercase tracking-widest">{hub.type}</span>
                    <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest truncate">{hub.location}</p>
                 </div>
              </div>
            </div>

            <div className="space-y-6 md:space-y-12">
              {/* FOOD MENU SECTION */}
              {hub.foodMenu && hub.foodMenu.length > 0 && (
                <div className="bg-[#0b1120] border border-slate-800 rounded-[30px] md:rounded-[50px] p-6 md:p-10 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Refuel Station / Food Menu</h3>
                  </div>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {hub.foodMenu.map((photo, i) => (
                      <button 
                        key={i} 
                        onClick={() => setActiveMenuPhoto(photo)}
                        className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border border-slate-800 hover:border-orange-500/50 transition-all hover:scale-105 active:scale-95 group"
                      >
                        <img src={photo} className="w-full h-full object-cover group-hover:brightness-125" alt="Menu Item" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {hub.type === 'TURF' && (
                <div className="bg-[#0b1120] border border-slate-800 rounded-[30px] md:rounded-[50px] p-6 md:p-10 shadow-xl">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Squad Size (For Split Billing)</h3>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 4, 6, 8, 10, 12, 14, 22].map((num) => (
                      <button 
                        key={num}
                        onClick={() => setPlayerCount(num)}
                        className={`w-12 h-12 rounded-xl font-black text-xs transition-all border ${playerCount === num ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600'}`}
                      >
                        {num}
                      </button>
                    ))}
                    <div className="flex items-center gap-3 px-4 bg-slate-900 border border-slate-800 rounded-xl">
                      <span className="text-[9px] font-black text-slate-600 uppercase">Players</span>
                      <input 
                        type="number" 
                        min="1" 
                        max="50"
                        value={playerCount}
                        onChange={(e) => setPlayerCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="bg-transparent text-white font-black text-xs w-8 outline-none"
                      />
                    </div>
                  </div>
                  <p className="mt-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Pricing will be split among {playerCount} players</p>
                </div>
              )}

              {hub.type === 'GAMING CAFE' && hub.accessories && (
                <div className="bg-[#0b1120] border border-slate-800 rounded-[30px] md:rounded-[50px] p-6 md:p-10 shadow-xl">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">1. Select Unit</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {hub.accessories.map(acc => (
                      <button 
                        key={acc.id} 
                        onClick={() => { setSelectedAccessory(acc); setSelectedSlot(null); }} 
                        className={`p-4 md:p-6 rounded-[24px] md:rounded-[32px] border transition-all text-left flex items-center justify-between group ${selectedAccessory?.id === acc.id ? 'bg-white border-white text-[#020617]' : 'bg-[#020617] border-slate-800 text-slate-400 hover:border-slate-600'}`}
                      >
                        <p className="text-sm md:text-lg font-black uppercase truncate pr-2">{acc.name}</p>
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center border transition-all ${selectedAccessory?.id === acc.id ? 'bg-[#020617] border-slate-800 text-white' : 'bg-slate-900 border-slate-800 group-hover:bg-emerald-500 group-hover:text-black'}`}>
                          {selectedAccessory?.id === acc.id ? '✓' : '→'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-[#0b1120] border border-slate-800 rounded-[30px] md:rounded-[50px] p-6 md:p-10 shadow-xl">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">
                  {hub.type === 'GAMING CAFE' ? '2. Select Slot' : 'Available Time Slots'}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                  {currentSlots.length > 0 ? currentSlots.map(slot => (
                    <button 
                      key={slot.id} 
                      onClick={() => setSelectedSlot(slot)} 
                      className={`p-4 md:p-6 rounded-[24px] md:rounded-[32px] border transition-all text-center flex flex-col gap-1 ${selectedSlot?.id === slot.id ? 'bg-emerald-500 border-emerald-400 text-[#020617] shadow-lg shadow-emerald-500/20' : 'bg-[#020617] border-slate-800 text-white hover:border-emerald-500/30'}`}
                    >
                      <p className="text-sm md:text-xl font-black">{slot.time}</p>
                      <p className={`text-[9px] font-black uppercase tracking-widest ${selectedSlot?.id === slot.id ? 'text-[#020617]/60' : 'text-emerald-500/80'}`}>₹{slot.price}</p>
                    </button>
                  )) : (
                    <div className="col-span-full py-10 text-center opacity-30">
                       <p className="text-[9px] font-black uppercase tracking-widest">No slots available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:h-fit">
            <div className="bg-[#0b1120] border border-slate-800 rounded-[30px] md:rounded-[50px] p-8 md:p-10 sticky top-32 shadow-2xl space-y-8 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[60px] pointer-events-none"></div>
              
              <h3 className="text-xl md:text-2xl font-black text-white uppercase mb-6 tracking-tighter">Summary</h3>
              
              {selectedSlot ? (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800/50 pb-3">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Venue Fee</span>
                      <span className="text-xs font-black text-white uppercase">₹{basePrice}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800/50 pb-3">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Garf Service</span>
                      <span className="text-xs font-black text-white uppercase">₹{serviceFee}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Total</span>
                      <span className="text-2xl font-black text-emerald-400 tracking-tighter">₹{totalPrice}</span>
                    </div>
                    
                    {playerCount > 1 && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex justify-between items-center">
                        <div>
                          <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Split Share</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase">{playerCount} Players</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-emerald-400 tracking-tight">₹{splitShare}</p>
                          <p className="text-[8px] font-bold text-slate-500 uppercase">per head</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-[20px] text-center">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Direct Transfer to Owner</p>
                    <p className="text-[10px] text-white font-black truncate">{hub.upiId}</p>
                  </div>

                  <button 
                    onClick={() => setShowPaymentModal(true)} 
                    className="w-full py-5 bg-emerald-500 text-[#020617] font-black rounded-2xl uppercase tracking-widest text-xs hover:scale-[1.03] transition-all shadow-[0_10px_30px_rgba(16,185,129,0.2)]"
                  >
                    Pay & Book Now
                  </button>
                </div>
              ) : (
                <div className="text-center py-12 opacity-10 space-y-3">
                  <div className="w-12 h-12 bg-slate-700 rounded-full mx-auto flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed">Select slot<br/>to continue</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* MENU FULL VIEW MODAL */}
      {activeMenuPhoto && (
        <div 
          className="fixed inset-0 z-[1000] bg-[#020617]/95 backdrop-blur-3xl flex items-center justify-center p-6 cursor-zoom-out"
          onClick={() => setActiveMenuPhoto(null)}
        >
          <div className="relative max-w-4xl w-full h-full flex items-center justify-center">
             <img src={activeMenuPhoto} className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl animate-in zoom-in duration-300" alt="Menu Full View" />
             <button className="absolute top-0 right-0 md:-top-12 md:-right-12 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white font-black">✕</button>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 z-[500] bg-[#020617]/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0b1120] border border-slate-800 rounded-[30px] md:rounded-[50px] p-6 md:p-10 w-full max-w-lg shadow-2xl text-center flex flex-col max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in duration-300">
            <header className="mb-6">
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-2">Direct Payment</h2>
              <p className="text-slate-500 font-bold uppercase text-[9px] tracking-widest">Scan with any UPI App to {hub.name}</p>
            </header>

            <div className="relative group mx-auto mb-8 shrink-0">
              <div className="absolute -inset-6 md:-inset-10 bg-emerald-500/10 rounded-full blur-[60px] animate-pulse"></div>
              <div className="relative bg-white p-4 md:p-6 rounded-[20px] md:rounded-[40px] inline-block border-2 border-emerald-500/20">
                <img src={qrCodeUrl} className="w-48 h-48 md:w-60 md:h-60" alt="UPI QR Code" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                  <p className="text-2xl font-black text-white tracking-tight">₹{totalPrice}</p>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Total Bill</p>
                </div>
                {playerCount > 1 ? (
                  <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20">
                    <p className="text-2xl font-black text-emerald-400 tracking-tight">₹{splitShare}</p>
                    <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1">Per Player</p>
                  </div>
                ) : (
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                    <p className="text-2xl font-black text-slate-500 tracking-tight">1</p>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Player</p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-3">
                <a href={upiLink} className="md:hidden w-full py-4 bg-white text-[#020617] font-black rounded-xl uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all">Open UPI App</a>
                <button 
                  onClick={handleConfirmPayment} 
                  disabled={isProcessing} 
                  className="w-full py-4 bg-emerald-500 text-[#020617] font-black rounded-xl uppercase tracking-widest text-[10px] disabled:opacity-50 hover:bg-emerald-400 transition-all"
                >
                  {isProcessing ? 'VERIFYING...' : 'I HAVE TRANSFERRED FUNDS'}
                </button>
                <button onClick={() => setShowPaymentModal(false)} className="text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-red-500 py-2 transition-colors">Go Back</button>
              </div>
            </div>

            <footer className="mt-6 pt-6 border-t border-slate-800/50 flex justify-center gap-4 md:gap-8 opacity-40 shrink-0">
               {['GPAY', 'PHONEPE', 'PAYTM'].map(p => <span key={p} className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{p}</span>)}
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default HubDetailView;