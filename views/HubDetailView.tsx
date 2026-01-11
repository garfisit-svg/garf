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
}

const HubDetailView: React.FC<HubDetailViewProps> = ({ hub, role, onBack, onLogout, onBook }) => {
  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(hub.accessories && hub.accessories.length > 0 ? hub.accessories[0] : null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [playerCount, setPlayerCount] = useState<number>(5);
  const [showSummary, setShowSummary] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- RAZORPAY INTEGRATION ---
  const handleRazorpayPayment = () => {
    if (!selectedSlot) return;

    setIsProcessing(true);

    const options = {
      key: "rzp_test_YOUR_KEY_HERE", // REPLACE WITH YOUR ACTUAL KEY FROM RAZORPAY DASHBOARD
      amount: selectedSlot.price * 100, // Razorpay works in Paise (100 Paise = 1 Rupee)
      currency: "INR",
      name: "Garf Arena",
      description: `Booking for ${hub.name} - ${selectedSlot.time}`,
      image: hub.images[0],
      handler: function (response: any) {
        // This runs after successful payment
        onBook({
          hubId: hub.id,
          hubName: hub.name,
          slotTime: selectedSlot.time,
          paymentMethod: 'online',
          paymentId: response.razorpay_payment_id, // Store this for verification
          accessoryName: selectedAccessory?.name,
          playerCount: hub.type === 'TURF' ? playerCount : undefined
        });
        setIsProcessing(false);
      },
      prefill: {
        name: "Garf Player",
        email: "player@garf.io",
        contact: "9999999999"
      },
      theme: {
        color: "#10b981" // Garf Emerald Green
      },
      modal: {
        ondismiss: function() {
          setIsProcessing(false);
        }
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  const displaySlots = hub.type === 'TURF' ? hub.slots : (selectedAccessory?.slots || []);

  return (
    <div className="min-h-screen bg-[#020617] relative pb-20">
      <Navbar role={role} onLogout={onLogout} onNavigateHome={onBack} />
      
      {isProcessing && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-emerald-400 font-black uppercase tracking-widest text-xs">Securing Transmission...</p>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-colors font-bold uppercase tracking-widest text-xs">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Browse
        </button>

        <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
          <div className="space-y-12">
            <section className="space-y-4">
              <div className="relative aspect-[16/9] w-full rounded-[48px] overflow-hidden border border-slate-800 shadow-2xl">
                <img src={hub.images[activeImageIdx]} className="w-full h-full object-cover" alt={hub.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
            </section>

            <div className="bg-[#0b1120] border border-slate-800 rounded-[40px] p-10">
              <h1 className="text-5xl font-black text-white tracking-tighter uppercase mb-6">{hub.name}</h1>
              <p className="text-slate-400 text-xl leading-relaxed mb-10">{hub.description}</p>

              {hub.type === 'TURF' && (
                <div className="mb-12">
                   <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4">Split Control</p>
                   <div className="flex items-center gap-6 bg-[#020617] border border-slate-800 rounded-3xl p-6">
                      <input type="range" min="1" max="22" value={playerCount} onChange={(e) => setPlayerCount(parseInt(e.target.value))} className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#10b981]" />
                      <div className="text-2xl font-black text-[#10b981]">{playerCount}</div>
                   </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displaySlots.map((slot) => (
                  <button key={slot.id} disabled={!slot.available} onClick={() => setSelectedSlot(slot)} className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-1 ${!slot.available ? 'opacity-20 cursor-not-allowed' : selectedSlot?.id === slot.id ? 'bg-emerald-500 border-emerald-400 text-[#020617]' : 'bg-[#020617] border-slate-800 text-white hover:border-slate-600'}`}>
                    <span className="text-2xl font-black">{slot.time}</span>
                    <span className="text-sm font-black">₹{slot.price}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="sticky top-28">
            <div className="bg-[#0b1120] border border-slate-800 rounded-[40px] p-10 shadow-2xl">
              <h3 className="text-3xl font-black text-white mb-8 tracking-tighter uppercase">Order Summary</h3>
              {selectedSlot ? (
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between"><span className="text-slate-500 text-xs font-black uppercase">Venue</span><span className="text-white font-black">{hub.name}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 text-xs font-black uppercase">Time</span><span className="text-white font-black">{selectedSlot.time}</span></div>
                  <div className="h-px bg-slate-800 my-4"></div>
                  <div className="flex justify-between items-center"><span className="text-slate-500 text-xs font-black uppercase">Total Payable</span><span className="text-3xl font-black text-emerald-400">₹{selectedSlot.price}</span></div>
                </div>
              ) : (
                <p className="text-slate-600 text-xs font-black uppercase mb-8">Select a slot to proceed</p>
              )}
              <button 
                disabled={!selectedSlot || isProcessing} 
                onClick={handleRazorpayPayment} 
                className={`w-full py-5 rounded-2xl font-black text-lg transition-all uppercase tracking-widest ${selectedSlot ? 'bg-emerald-500 text-[#020617] hover:bg-emerald-400' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
              >
                Pay Now with Razorpay
              </button>
              <div className="mt-6 flex items-center justify-center gap-2 opacity-30">
                <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center font-black text-[8px]">VISA</div>
                <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center font-black text-[8px]">UPI</div>
                <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center font-black text-[8px]">RUPAY</div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default HubDetailView;