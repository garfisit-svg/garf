import React, { useState } from 'react';
import { Hub, UserRole, TimeSlot, Category, Booking, Review } from '../types';
import Navbar from '../components/Navbar';

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
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [playerCount, setPlayerCount] = useState<number>(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeMenuPhoto, setActiveMenuPhoto] = useState<string | null>(null);

  const getAvailabilityForSlot = (catId: string, slotTime: string) => {
    const category = hub.categories?.find(c => c.id === catId);
    if (!category) return 0;
    
    const bookedUnits = allBookings
      .filter(b => b.hubId === hub.id && b.categoryId === catId && b.slotTime === slotTime && b.status !== 'expired')
      .reduce((acc, curr) => acc + (Number(curr.playerCount) || 1), 0);
    
    return Math.max(0, category.totalUnits - bookedUnits);
  };

  const hubBookingCount = allBookings.filter(b => b.hubId === hub.id && b.status === 'confirmed').length;
  const serviceFee = hubBookingCount >= 50 ? 10 : 0;
  const basePrice = selectedSlot ? selectedSlot.price : 0;
  const totalPrice = basePrice + serviceFee;
  const splitShare = Math.ceil(totalPrice / playerCount);

  const bookingRef = selectedCategory ? `${hub.name}-${selectedCategory.name}` : hub.name;
  const upiLink = selectedSlot ? `upi://pay?pa=${hub.upiId}&pn=${encodeURIComponent(hub.name)}&am=${totalPrice}&cu=INR&tn=${encodeURIComponent('Garf Booking: ' + bookingRef)}` : '';
  const qrCodeUrl = selectedSlot ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}` : '';

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onBook({
        hubId: hub.id,
        hubName: hub.name,
        categoryId: selectedCategory?.id,
        categoryName: selectedCategory?.name,
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

  const currentSlots = hub.type === 'TURF' ? hub.slots : (selectedCategory?.slots || []);

  return (
    <div className="min-h-screen bg-[#020617] pb-10 font-inter">
      <Navbar role={role} onLogout={onLogout} onNavigateHome={onBack} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <button onClick={onBack} className="text-slate-500 font-black text-[9px] uppercase tracking-[0.4em] mb-8 flex items-center gap-2 hover:text-white transition-colors group">
          <div className="w-7 h-7 rounded-full border border-slate-800 flex items-center justify-center group-hover:border-slate-500 transition-all">←</div>
          BACK TO BROWSE
        </button>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8 xl:gap-16">
          <div className="space-y-8 md:space-y-12">
            <div className="relative aspect-video rounded-[30px] md:rounded-[60px] overflow-hidden border border-slate-800 shadow-2xl group">
              <img src={hub.images[0]} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105" alt={hub.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 pr-6">
                 <h1 className="text-3xl md:text-6xl font-black text-white uppercase tracking-tighter mb-2 leading-none truncate">{hub.name}</h1>
                 <div className="flex items-center gap-3">
                    <span className="bg-emerald-500 text-[#020617] font-black px-3 py-1 rounded-lg text-[10px] uppercase tracking-widest">{hub.type}</span>
                    <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">{hub.location}</p>
                 </div>
              </div>
            </div>

            <div className="space-y-6 md:space-y-12">
              {/* FOOD MENU SECTION */}
              {hub.foodMenu && hub.foodMenu.length > 0 && (
                <div className="bg-[#0b1120] border border-slate-800 rounded-[30px] md:rounded-[50px] p-6 md:p-10 shadow-xl">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Refuel Station (Food Menu)</h3>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {hub.foodMenu.map((photo, i) => (
                      <button key={i} onClick={() => setActiveMenuPhoto(photo)} className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border border-slate-800 hover:border-emerald-500/50 transition-all hover:scale-105 active:scale-95 group">
                        <img src={photo} className="w-full h-full object-cover group-hover:brightness-125" alt="Menu" />
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
                      <button key={num} onClick={() => setPlayerCount(num)} className={`w-12 h-12 rounded-xl font-black text-xs transition-all border ${playerCount === num ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600'}`}>
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {hub.type === 'GAMING CAFE' && hub.categories && (
                <div className="bg-[#0b1120] border border-slate-800 rounded-[30px] md:rounded-[50px] p-6 md:p-10 shadow-xl">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Equipment Tier</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {hub.categories.map(cat => (
                      <button 
                        key={cat.id} 
                        onClick={() => { setSelectedCategory(cat); setSelectedSlot(null); }} 
                        className={`p-6 rounded-[32px] border transition-all text-left flex flex-col justify-between group h-40 relative overflow-hidden ${selectedCategory?.id === cat.id ? 'bg-emerald-500 border-emerald-400 text-[#020617] shadow-xl shadow-emerald-500/20 scale-[1.02]' : 'bg-[#020617] border-slate-800 text-slate-400 hover:border-slate-600'}`}
                      >
                        <div className="relative z-10 flex flex-col h-full justify-between">
                          <div>
                            <h4 className="text-xl font-black uppercase tracking-tighter mb-1">{cat.name}</h4>
                            <p className={`text-[10px] font-black uppercase tracking-widest ${selectedCategory?.id === cat.id ? 'text-[#020617]/70' : 'text-slate-500'}`}>₹{cat.pricePerHour} / hour</p>
                          </div>
                          <div className={`mt-auto inline-flex items-center justify-center px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest ${selectedCategory?.id === cat.id ? 'bg-[#020617] border-slate-800 text-white' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                            {cat.totalUnits} Units Registered
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-[#0b1120] border border-slate-800 rounded-[30px] md:rounded-[50px] p-6 md:p-10 shadow-xl">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Available Time Windows</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                  {currentSlots.length > 0 ? currentSlots.map(slot => {
                    const availableUnits = hub.type === 'GAMING CAFE' && selectedCategory 
                      ? getAvailabilityForSlot(selectedCategory.id, slot.time) 
                      : 1;
                    const isFullyBooked = availableUnits <= 0;

                    return (
                      <button 
                        key={slot.id} 
                        disabled={isFullyBooked}
                        onClick={() => setSelectedSlot(slot)} 
                        className={`p-4 md:p-6 rounded-[24px] md:rounded-[32px] border transition-all text-center flex flex-col gap-1 relative overflow-hidden ${isFullyBooked ? 'opacity-30 grayscale cursor-not-allowed border-red-900/50' : selectedSlot?.id === slot.id ? 'bg-emerald-500 border-emerald-400 text-[#020617] shadow-lg shadow-emerald-500/20' : 'bg-[#020617] border-slate-800 text-white hover:border-emerald-500/30'}`}
                      >
                        <p className="text-sm md:text-xl font-black">{slot.time}</p>
                        {hub.type === 'GAMING CAFE' && selectedCategory && (
                          <p className={`text-[8px] font-black uppercase tracking-widest ${isFullyBooked ? 'text-red-500' : selectedSlot?.id === slot.id ? 'text-[#020617]/60' : 'text-emerald-500/80'}`}>
                            {isFullyBooked ? 'SOLD OUT' : `${availableUnits}/${selectedCategory.totalUnits} FREE`}
                          </p>
                        )}
                        {hub.type === 'TURF' && (
                          <p className={`text-[9px] font-black uppercase tracking-widest ${selectedSlot?.id === slot.id ? 'text-[#020617]/60' : 'text-emerald-500/80'}`}>₹{slot.price}</p>
                        )}
                      </button>
                    );
                  }) : (
                    <div className="col-span-full py-10 text-center opacity-30">
                       <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Select a category to<br/>view available slots</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:h-fit">
            <div className="bg-[#0b1120] border border-slate-800 rounded-[30px] md:rounded-[50px] p-8 md:p-10 sticky top-32 shadow-2xl space-y-8 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[60px] pointer-events-none"></div>
              
              <h3 className="text-xl md:text-2xl font-black text-white uppercase mb-6 tracking-tighter">Mission Brief</h3>
              
              {selectedSlot ? (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800/50 pb-3">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Base Rate</span>
                      <span className="text-xs font-black text-white uppercase">₹{basePrice}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800/50 pb-3">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Protocol Fee</span>
                      <span className="text-xs font-black text-white uppercase">₹{serviceFee}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Total</span>
                      <span className="text-2xl font-black text-emerald-400 tracking-tighter">₹{totalPrice}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowPaymentModal(true)} 
                    className="w-full py-5 bg-emerald-500 text-[#020617] font-black rounded-2xl uppercase tracking-widest text-xs hover:scale-[1.03] shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    Pay & Initialise
                  </button>
                </div>
              ) : (
                <div className="text-center py-12 opacity-10 space-y-3">
                  <div className="w-12 h-12 bg-slate-700 rounded-full mx-auto flex items-center justify-center">→</div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">Configure mission parameters</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* MENU FULL VIEW MODAL */}
      {activeMenuPhoto && (
        <div className="fixed inset-0 z-[1000] bg-[#020617]/95 backdrop-blur-3xl flex items-center justify-center p-6" onClick={() => setActiveMenuPhoto(null)}>
          <div className="relative max-w-4xl w-full h-full flex items-center justify-center">
             <img src={activeMenuPhoto} className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl animate-in zoom-in" alt="Menu" />
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 z-[500] bg-[#020617]/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0b1120] border border-slate-800 rounded-[40px] p-8 w-full max-w-lg shadow-2xl text-center flex flex-col max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in">
            <header className="mb-6">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Initialize Link</h2>
              <p className="text-slate-500 font-bold uppercase text-[9px] tracking-widest">Pay to: {hub.name}</p>
            </header>

            <div className="relative mx-auto mb-8 shrink-0">
              <div className="absolute -inset-10 bg-emerald-500/10 rounded-full blur-[60px] animate-pulse"></div>
              <div className="relative bg-white p-6 rounded-[40px] inline-block border-2 border-emerald-500/20">
                <img src={qrCodeUrl} className="w-60 h-60" alt="QR" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center">
                <p className="text-4xl font-black text-white tracking-tight">₹{totalPrice}</p>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Total Bill</p>
              </div>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleConfirmPayment} 
                  disabled={isProcessing} 
                  className="w-full py-5 bg-emerald-500 text-[#020617] font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl transition-all"
                >
                  {isProcessing ? 'VERIFYING...' : 'I HAVE TRANSFERRED FUNDS'}
                </button>
                <button onClick={() => setShowPaymentModal(false)} className="text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-red-500 transition-colors">Abort</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HubDetailView;