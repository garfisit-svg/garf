
import React, { useState } from 'react';
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
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash' | null>(null);
  const [isBooked, setIsBooked] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isPostingReview, setIsPostingReview] = useState(false);

  const handleConfirmOrder = () => {
    setShowSummary(true);
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

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewComment.trim() === '') return;
    
    setIsPostingReview(true);
    setTimeout(() => {
      onPostReview(hub.id, {
        userName: 'Current User', // Mock name
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
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-colors font-bold uppercase tracking-widest text-xs"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Browse
        </button>

        <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
          <div className="space-y-12">
            
            {/* Image Gallery Showcase */}
            <section className="space-y-4">
              <div className="relative aspect-[16/9] w-full rounded-[48px] overflow-hidden border border-slate-800 shadow-2xl">
                <img 
                  src={hub.images[activeImageIdx]} 
                  className="w-full h-full object-cover transition-all duration-700" 
                  alt={hub.name} 
                />
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
                  <button 
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`flex-shrink-0 w-32 h-20 rounded-2xl overflow-hidden border-2 transition-all ${activeImageIdx === idx ? 'border-emerald-500 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            </section>

            <div className="bg-[#0b1120] border border-slate-800 rounded-[40px] p-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center">
                   <span className="text-white font-black text-xs uppercase">{hub.type === 'TURF' ? 'Turf' : 'Gear'}</span>
                </div>
                <h1 className="text-5xl font-black text-white tracking-tighter uppercase">{hub.name}</h1>
              </div>
              <p className="text-slate-400 text-xl leading-relaxed mb-10 max-w-3xl">
                {hub.description}
              </p>

              {hub.type === 'TURF' && (
                <div className="mb-12">
                   <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/20 mb-6 inline-flex">
                      <span className="text-[10px] font-black uppercase tracking-widest">01</span>
                      <span className="font-black uppercase">Number of Players</span>
                   </div>
                   <div className="flex items-center gap-6 bg-[#020617] border border-slate-800 rounded-3xl p-6">
                      <input 
                        type="range" 
                        min="1" 
                        max="22" 
                        value={playerCount} 
                        onChange={(e) => setPlayerCount(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#10b981]"
                      />
                      <div className="w-20 h-14 bg-[#0b1120] border border-slate-800 rounded-2xl flex items-center justify-center">
                         <span className="text-2xl font-black text-[#10b981]">{playerCount}</span>
                      </div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest max-w-[80px]">Total Athletes</p>
                   </div>
                </div>
              )}

              {hub.type === 'GAMING CAFE' && hub.accessories && (
                <div className="mb-12">
                  <div className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-xl border border-blue-500/20 mb-6 inline-flex">
                    <span className="text-[10px] font-black uppercase tracking-widest">01</span>
                    <span className="font-black uppercase">Select Gear Unit</span>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {hub.accessories.map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => {
                          setSelectedAccessory(acc);
                          setSelectedSlot(null);
                        }}
                        className={`flex-shrink-0 px-8 py-5 rounded-3xl border transition-all ${
                          selectedAccessory?.id === acc.id
                            ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                            : 'bg-[#020617] border-slate-800 text-slate-500 hover:border-slate-600'
                        }`}
                      >
                        <p className="text-xs font-black uppercase tracking-widest mb-1">Unit</p>
                        <p className="text-xl font-black">{acc.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/20 mb-8 inline-flex">
                <span className="text-[10px] font-black uppercase tracking-widest">02</span>
                <span className="font-black uppercase">Pick Session Time</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displaySlots.length > 0 ? displaySlots.map((slot) => (
                  <button
                    key={slot.id}
                    disabled={!slot.available}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-1 relative overflow-hidden ${
                      !slot.available 
                        ? 'bg-slate-900 border-slate-800 opacity-40 cursor-not-allowed' 
                        : selectedSlot?.id === slot.id 
                          ? 'bg-emerald-500 border-emerald-400 text-[#020617] shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                          : 'bg-[#020617] border-slate-800 text-white hover:border-slate-600'
                    }`}
                  >
                    {!slot.available && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest">Booked</div>
                    )}
                    <span className="text-2xl font-black">{slot.time}</span>
                    <div className="flex items-center gap-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${selectedSlot?.id === slot.id ? 'text-[#020617]/70' : 'text-slate-500'}`}>Price</span>
                      <span className={`text-sm font-black ${selectedSlot?.id === slot.id ? 'text-[#020617]' : 'text-emerald-400'}`}>₹{slot.price}</span>
                    </div>
                  </button>
                )) : (
                  <div className="col-span-full py-12 text-center bg-[#020617] border border-dashed border-slate-800 rounded-3xl">
                    <p className="text-slate-600 font-black uppercase tracking-widest">No slots available for this selection</p>
                  </div>
                )}
              </div>
            </div>

            {/* Dynamic Community Feedback / Review System */}
            <div className="bg-[#0b1120] border border-slate-800 rounded-[40px] p-10">
               <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                     <StarIcon className="w-6 h-6 text-yellow-400" />
                     <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Arena Intel & Reviews</h3>
                  </div>
                  <div className="text-right">
                     <p className="text-4xl font-black text-white">{hub.rating}</p>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">User Aggregate</p>
                  </div>
               </div>

               {/* Write Review Section */}
               <form onSubmit={handleSubmitReview} className="bg-[#020617] rounded-3xl p-8 border border-slate-800 mb-10">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Contribute your experience</p>
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-2">
                       {[1, 2, 3, 4, 5].map((star) => (
                         <button 
                           key={star} 
                           type="button"
                           onClick={() => setReviewRating(star)}
                           className="transition-transform hover:scale-125 focus:outline-none"
                         >
                           <StarIcon className={`w-8 h-8 ${star <= reviewRating ? 'text-yellow-400' : 'text-slate-700'}`} />
                         </button>
                       ))}
                       <span className="ml-4 text-sm font-black text-slate-500 uppercase tracking-widest">{reviewRating}/5</span>
                    </div>
                    <textarea 
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share intel about the equipment, pitch quality or atmosphere..."
                      className="w-full bg-[#0b1120] border border-slate-800 rounded-2xl p-6 text-white outline-none focus:border-emerald-500 transition-all resize-none font-medium placeholder:text-slate-700"
                      rows={3}
                    />
                    <button 
                      disabled={isPostingReview || !reviewComment.trim()}
                      className={`py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${reviewComment.trim() ? 'bg-emerald-500 text-[#020617] hover:scale-[1.02]' : 'bg-slate-800 text-slate-600'}`}
                    >
                      {isPostingReview ? 'Transmitting...' : 'Post Intel'}
                    </button>
                  </div>
               </form>

               {/* Review List */}
               <div className="space-y-6">
                  {hub.reviews && hub.reviews.length > 0 ? hub.reviews.map((rev) => (
                    <div key={rev.id} className="bg-slate-900/30 border border-slate-800/50 rounded-3xl p-6 animate-in slide-in-from-bottom-4 duration-500">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-[#10b981] text-xs">
                             {rev.userName.charAt(0)}
                           </div>
                           <div>
                              <p className="font-black text-white uppercase text-xs">{rev.userName}</p>
                              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{rev.date}</p>
                           </div>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <StarIcon key={s} className={`w-3 h-3 ${s <= rev.rating ? 'text-yellow-400' : 'text-slate-800'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm font-medium leading-relaxed italic">"{rev.comment}"</p>
                    </div>
                  )) : (
                    <div className="text-center py-12 border border-dashed border-slate-800 rounded-3xl">
                       <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">No reviews found for this sector</p>
                    </div>
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
                     <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Hub</span>
                        <span className="text-white font-black truncate max-w-[150px]">{hub.name}</span>
                     </div>
                     {hub.type === 'GAMING CAFE' && selectedAccessory && (
                       <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Unit</span>
                          <span className="text-blue-400 font-black">{selectedAccessory.name}</span>
                       </div>
                     )}
                     <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Session</span>
                        <span className="text-white font-black">{selectedSlot.time}</span>
                     </div>
                     {hub.type === 'TURF' && (
                       <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Team Size</span>
                          <span className="text-white font-black">{playerCount} Players</span>
                       </div>
                     )}
                     <div className="h-px bg-slate-800"></div>
                     {hub.type === 'TURF' && (
                       <div className="flex justify-between items-center p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/20">
                          <span className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.2em]">Split Share</span>
                          <span className="text-xl font-black text-emerald-400">₹{Math.round(selectedSlot.price / playerCount)} <span className="text-[10px] opacity-60">/person</span></span>
                       </div>
                     )}
                     <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Total Bill</span>
                        <span className="text-3xl font-black text-white">₹{selectedSlot.price}</span>
                     </div>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                       <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                    </div>
                    <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Complete selection to proceed</p>
                  </>
                )}
              </div>

              {(hub.contactPhone || hub.contactEmail) && (
                <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 mb-8 space-y-4">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-slate-800 pb-2">Arena Contact Intel</p>
                  {hub.contactPhone && (
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      <span className="text-sm font-bold text-white">{hub.contactPhone}</span>
                    </div>
                  )}
                  {hub.contactEmail && (
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      <span className="text-sm font-bold text-white truncate">{hub.contactEmail}</span>
                    </div>
                  )}
                </div>
              )}

              <button 
                disabled={!selectedSlot}
                onClick={handleConfirmOrder}
                className={`w-full py-5 rounded-2xl font-black text-lg transition-all uppercase tracking-widest ${
                  selectedSlot 
                    ? 'bg-emerald-500 text-[#020617] hover:bg-emerald-400 shadow-[0_8px_30px_rgba(16,185,129,0.3)]' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Book Session
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
                  {hub.type === 'GAMING CAFE' && selectedAccessory && (
                    <div className="flex justify-between pb-4 border-b border-slate-800/30">
                      <span className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Unit</span>
                      <span className="text-blue-400 font-black">{selectedAccessory.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between pb-4 border-b border-slate-800/30">
                    <span className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Time Slot</span>
                    <span className="text-white font-black">{selectedSlot?.time}</span>
                  </div>
                  {hub.type === 'TURF' && (
                    <div className="flex justify-between pb-4 border-b border-slate-800/30">
                      <span className="text-[#10b981] font-black uppercase text-[10px] tracking-widest">Per Person Share</span>
                      <span className="text-white font-black">₹{Math.round((selectedSlot?.price || 0) / playerCount)} × {playerCount}</span>
                    </div>
                  )}
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
                  Finalize Booking
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
