import React, { useState, useEffect } from 'react';
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
  allBookings?: Booking[]; // Added to calculate fee threshold
}

const HubDetailView: React.FC<HubDetailViewProps> = ({ hub, role, onBack, onLogout, onBook, allBookings = [] }) => {
  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(hub.type === 'GAMING CAFE' && hub.accessories ? hub.accessories[0] : null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- SERVICE FEE LOGIC ---
  // Every cafe gets first 50 bookings with 0 GARF fee. After 50, ₹10 fee.
  const hubBookingCount = allBookings.filter(b => b.hubId === hub.id && b.status === 'confirmed').length;
  const serviceFee = hubBookingCount >= 50 ? 10 : 0;
  const totalPrice = selectedSlot ? selectedSlot.price + serviceFee : 0;

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
        accessoryName: selectedAccessory?.name,
        slotTime: selectedSlot?.time,
        paymentMethod: 'upi',
        status: 'confirmed',
        basePrice: selectedSlot?.price,
        serviceFee: serviceFee,
        totalPrice: totalPrice
      });
      setIsProcessing(false);
      setShowPaymentModal(false);
    }, 2000);
  };

  const currentSlots = hub.type === 'TURF' ? hub.slots : (selectedAccessory?.slots || []);

  return (
    <div className="min-h-screen bg-[#020617] pb-20 font-inter">
      <Navbar role={role} onLogout={onLogout} onNavigateHome={onBack} />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <button onClick={onBack} className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em] mb-12 flex items-center gap-2 hover:text-white transition-colors group">
          <div className="w-8 h-8 rounded-full border border-slate-800 flex items-center justify-center group-hover:border-slate-500 transition-all">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </div>
          BACK TO BROWSE
        </button>

        <div className="grid lg:grid-cols-[1fr_420px] gap-16">
          <div className="space-y-12">
            <div className="relative aspect-video rounded-[60px] overflow-hidden border border-slate-800 shadow-2xl group">
              <img src={hub.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" alt={hub.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent"></div>
              <div className="absolute bottom-12 left-12">
                 <h1 className="text-7xl font-black text-white uppercase tracking-tighter mb-4 leading-none">{hub.name}</h1>
                 <div className="flex items-center gap-3">
                    <span className="bg-emerald-500 text-[#020617] font-black px-4 py-1.5 rounded-xl text-[10px] uppercase tracking-widest">{hub.type}</span>
                    <p className="text-slate-400 font-black uppercase text-xs tracking-widest">{hub.location}</p>
                 </div>
              </div>
            </div>

            <div className="space-y-12">
              {hub.type === 'GAMING CAFE' && hub.accessories && (
                <div className="bg-[#0b1120] border border-slate-800 rounded-[50px] p-10 shadow-xl">
                  <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] mb-8">1. Select Item</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {hub.accessories.map(acc => (
                      <button 
                        key={acc.id} 
                        onClick={() => { setSelectedAccessory(acc); setSelectedSlot(null); }} 
                        className={`p-6 rounded-[32px] border transition-all text-left flex items-center justify-between group ${selectedAccessory?.id === acc.id ? 'bg-white border-white text-[#020617]' : 'bg-[#020617] border-slate-800 text-slate-400 hover:border-slate-600'}`}
                      >
                        <div>
                          <p className="text-lg font-black uppercase">{acc.name}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${selectedAccessory?.id === acc.id ? 'bg-[#020617] border-slate-800 text-white' : 'bg-slate-900 border-slate-800 group-hover:bg-emerald-500 group-hover:text-black'}`}>
                          {selectedAccessory?.id === acc.id ? '✓' : '→'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-[#0b1120] border border-slate-800 rounded-[50px] p-10 shadow-xl">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] mb-8">
                  {hub.type === 'GAMING CAFE' ? '2. Select Time Slot' : 'Available Time Slots'}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {currentSlots.length > 0 ? currentSlots.map(slot => (
                    <button 
                      key={slot.id} 
                      onClick={() => setSelectedSlot(slot)} 
                      className={`p-6 rounded-[32px] border transition-all text-center flex flex-col gap-1 ${selectedSlot?.id === slot.id ? 'bg-emerald-500 border-emerald-400 text-[#020617] shadow-lg shadow-emerald-500/20' : 'bg-[#020617] border-slate-800 text-white hover:border-emerald-500/30'}`}
                    >
                      <p className="text-xl font-black">{slot.time}</p>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${selectedSlot?.id === slot.id ? 'text-[#020617]/60' : 'text-emerald-500/80'}`}>₹{slot.price}</p>
                    </button>
                  )) : (
                    <div className="col-span-full py-10 text-center opacity-30">
                       <p className="text-[10px] font-black uppercase tracking-widest">No slots available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <aside>
            <div className="bg-[#0b1120] border border-slate-800 rounded-[50px] p-12 sticky top-32 shadow-2xl space-y-10 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 blur-[80px] pointer-events-none"></div>
              
              <h3 className="text-3xl font-black text-white uppercase mb-8 tracking-tighter">Booking Summary</h3>
              
              {selectedSlot ? (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800/50 pb-4">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Venue Price</span>
                      <span className="text-sm font-black text-white uppercase">₹{selectedSlot.price}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800/50 pb-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Garf Service Fee</span>
                        {serviceFee === 0 && <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">First 50 Bookings Free!</span>}
                      </div>
                      <span className="text-sm font-black text-white uppercase">₹{serviceFee}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</span>
                      <span className="text-4xl font-black text-emerald-400 tracking-tighter">₹{totalPrice}</span>
                    </div>
                  </div>

                  <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-[32px]">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Direct-to-Owner Payment</p>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Payment goes directly to: <span className="text-white font-bold">{hub.upiId}</span></p>
                  </div>

                  <button 
                    onClick={() => setShowPaymentModal(true)} 
                    className="w-full py-6 bg-emerald-500 text-[#020617] font-black rounded-[28px] uppercase tracking-widest text-sm hover:scale-[1.03] transition-all shadow-[0_12px_48px_rgba(16,185,129,0.3)]"
                  >
                    Pay & Book Now
                  </button>
                </div>
              ) : (
                <div className="text-center py-16 opacity-10 space-y-4">
                  <div className="w-16 h-16 bg-slate-700 rounded-full mx-auto flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] px-8 leading-loose">Select a slot to continue</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] bg-[#020617]/98 backdrop-blur-2xl flex items-center justify-center p-6">
          <div className="bg-[#0b1120] border border-slate-800 rounded-[70px] p-14 w-full max-w-xl shadow-2xl text-center space-y-10 animate-in zoom-in duration-300 border-t-emerald-500/50">
            <header>
              <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none mb-3">Direct Transfer</h2>
              <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest">Scan to Pay {hub.name}</p>
            </header>

            <div className="relative group mx-auto inline-block">
              <div className="absolute -inset-10 bg-emerald-500/20 rounded-full blur-[100px] animate-pulse"></div>
              <div className="relative bg-white p-10 rounded-[50px] inline-block shadow-2xl border-4 border-emerald-500/20">
                <img src={qrCodeUrl} className="w-56 h-56 md:w-72 md:h-72" alt="UPI QR Code" />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-5xl font-black text-white tracking-tighter">₹{totalPrice}</p>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Payable Amount</p>
              </div>
              
              <div className="flex flex-col gap-3">
                <a href={upiLink} className="md:hidden w-full py-5 bg-white text-[#020617] font-black rounded-3xl uppercase tracking-widest text-xs hover:bg-slate-200 transition-all">Pay via UPI App</a>
                <button 
                  onClick={handleConfirmPayment} 
                  disabled={isProcessing} 
                  className="w-full py-5 bg-emerald-500 text-[#020617] font-black rounded-3xl uppercase tracking-widest text-xs disabled:opacity-50 transition-all hover:scale-[1.02]"
                >
                  {isProcessing ? 'Confirming...' : 'I Have Transferred Funds'}
                </button>
                <button onClick={() => setShowPaymentModal(false)} className="text-[11px] font-black text-slate-600 uppercase tracking-widest hover:text-red-500 transition-colors">Go Back</button>
              </div>
            </div>

            <footer className="pt-6 border-t border-slate-800/50 flex justify-center gap-8 opacity-40">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">GPAY</span>
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">PHONEPE</span>
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">PAYTM</span>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default HubDetailView;