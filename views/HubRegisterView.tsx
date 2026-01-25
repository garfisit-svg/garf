import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Hub, Category, TimeSlot } from '../types';

interface SlotData {
  id: string;
  time: string;
  price: string;
}

interface CategoryData {
  id: string;
  name: string;
  totalUnits: string;
  pricePerHour: string;
  image?: string;
  slots: SlotData[];
}

interface HubRegisterViewProps {
  onBack: () => void;
  onLogout: () => void;
  onNavigateHome: () => void;
  hubToEdit?: Hub;
  onSave: (hub: Hub) => void;
}

const HubRegisterView: React.FC<HubRegisterViewProps> = ({ onBack, onLogout, onNavigateHome, hubToEdit, onSave }) => {
  const [hubType, setHubType] = useState<'TURF' | 'GAMING CAFE'>('TURF');
  const [venueName, setVenueName] = useState('');
  const [address, setAddress] = useState('');
  const [upiId, setUpiId] = useState('');
  const [images, setImages] = useState<string[]>(['']);
  const [foodMenu, setFoodMenu] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  
  const [turfSlots, setTurfSlots] = useState<SlotData[]>([
    { id: 'ts1', time: '16:00 - 17:00', price: '1200' }
  ]);

  const [categories, setCategories] = useState<CategoryData[]>([
    { 
      id: 'cat1', 
      name: 'Normal PC', 
      totalUnits: '30',
      pricePerHour: '50',
      slots: [{ id: 's1', time: '10:00 - 11:00', price: '50' }] 
    }
  ]);

  useEffect(() => {
    if (hubToEdit) {
      setHubType(hubToEdit.type);
      setVenueName(hubToEdit.name);
      setAddress(hubToEdit.location);
      setUpiId(hubToEdit.upiId || '');
      setImages(hubToEdit.images.length > 0 ? hubToEdit.images : ['']);
      setFoodMenu(hubToEdit.foodMenu || []);
      setDescription(hubToEdit.description);
      setContactPhone(hubToEdit.contactPhone || '');
      setContactEmail(hubToEdit.contactEmail || '');
      
      if (hubToEdit.type === 'TURF') {
        setTurfSlots(hubToEdit.slots.map(s => ({
          id: s.id,
          time: s.time,
          price: s.price.toString()
        })));
      } else if (hubToEdit.categories && hubToEdit.categories.length > 0) {
        setCategories(hubToEdit.categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          totalUnits: (cat.totalUnits || 0).toString(),
          pricePerHour: (cat.pricePerHour || 0).toString(),
          image: cat.image,
          slots: (cat.slots || []).map(s => ({
            id: s.id,
            time: s.time,
            price: s.price.toString()
          }))
        })));
      }
    }
  }, [hubToEdit]);

  const handleAddImage = () => setImages([...images, '']);
  const handleUpdateImage = (idx: number, val: string) => {
    const next = [...images];
    next[idx] = val;
    setImages(next);
  };
  const handleRemoveImage = (idx: number) => setImages(images.filter((_, i) => i !== idx));

  const handleAddMenuImage = () => setFoodMenu([...foodMenu, '']);
  const handleUpdateMenuImage = (idx: number, val: string) => {
    const next = [...foodMenu];
    next[idx] = val;
    setFoodMenu(next);
  };
  const handleRemoveMenuImage = (idx: number) => setFoodMenu(foodMenu.filter((_, i) => i !== idx));

  const handleAddTurfSlot = () => setTurfSlots([...turfSlots, { id: 'ts'+Date.now(), time: '09:00 - 10:00', price: '1000' }]);
  const handleRemoveTurfSlot = (id: string) => setTurfSlots(turfSlots.filter(s => s.id !== id));
  const handleUpdateTurfSlot = (id: string, field: keyof SlotData, val: string) => {
    setTurfSlots(turfSlots.map(s => s.id === id ? { ...s, [field]: val } : s));
  };

  const handleAddCategory = () => {
    setCategories([...categories, {
      id: 'cat'+Date.now(),
      name: 'New Tier',
      totalUnits: '10',
      pricePerHour: '100',
      slots: [{ id: 's'+Date.now(), time: '10:00 - 11:00', price: '100' }]
    }]);
  };

  const handleRemoveCategory = (id: string) => {
    if (categories.length > 1) setCategories(categories.filter(c => c.id !== id));
  };

  const handleUpdateCategory = (id: string, field: keyof CategoryData, val: any) => {
    setCategories(categories.map(cat => cat.id === id ? { ...cat, [field]: val } : cat));
  };

  const handleAddSlotToCategory = (catId: string) => {
    setCategories(categories.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        slots: [...cat.slots, { id: 's'+Date.now(), time: '12:00 - 13:00', price: cat.pricePerHour }]
      };
    }));
  };

  const handleRemoveSlotFromCategory = (catId: string, slotId: string) => {
    setCategories(categories.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        slots: cat.slots.filter(s => s.id !== slotId)
      };
    }));
  };

  const handleUpdateCategorySlot = (catId: string, slotId: string, field: keyof SlotData, val: string) => {
    setCategories(categories.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        slots: cat.slots.map(s => s.id === slotId ? { ...s, [field]: val } : s)
      };
    }));
  };

  const handleLaunch = () => {
    if (!venueName || !address || !upiId) {
      alert("Venue Name, Address, and UPI ID are required.");
      return;
    }

    const finalSlots: TimeSlot[] = turfSlots.map(ts => ({
      id: ts.id,
      time: ts.time,
      price: parseInt(ts.price) || 0,
      available: true
    }));

    const finalCategories: Category[] = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      totalUnits: parseInt(cat.totalUnits) || 1,
      pricePerHour: parseInt(cat.pricePerHour) || 0,
      image: cat.image,
      slots: cat.slots.map(s => ({
        id: s.id,
        time: s.time,
        price: parseInt(s.price) || 0,
        available: true
      }))
    }));

    const newHub: Hub = {
      id: hubToEdit?.id || 'hub-' + Date.now(),
      name: venueName,
      type: hubType,
      location: address,
      upiId: upiId,
      rating: hubToEdit?.rating || 5.0,
      images: images.filter(u => u.trim() !== ''),
      foodMenu: foodMenu.filter(u => u.trim() !== ''),
      priceStart: hubType === 'TURF' ? (finalSlots[0]?.price || 0) : Math.min(...finalCategories.map(c => c.pricePerHour)),
      description: description || `Elite ${hubType.toLowerCase()} hub experience.`,
      amenities: hubToEdit?.amenities || ['Parking', 'Water', 'Locker'],
      slots: hubType === 'TURF' ? finalSlots : [],
      categories: hubType === 'GAMING CAFE' ? finalCategories : undefined,
      contactPhone,
      contactEmail
    };

    onSave(newHub);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-20 font-inter">
      <Navbar role="owner" onLogout={onLogout} onNavigateHome={onNavigateHome} />
      
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-[#0b1120] border border-slate-800 rounded-[48px] p-8 md:p-14 shadow-2xl space-y-16 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[120px] pointer-events-none"></div>

          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-10">
            <div>
              <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-none mb-4">{hubToEdit ? 'Update Venue' : 'Deploy Venue'}</h1>
              <p className="text-emerald-500 font-black uppercase tracking-[0.4em] text-[10px]">Strategic Configuration Interface</p>
            </div>
            <div className="flex bg-[#020617] border border-slate-800 p-1.5 rounded-2xl">
              {['TURF', 'GAMING CAFE'].map((t) => (
                <button 
                  key={t} 
                  onClick={() => setHubType(t as any)} 
                  className={`px-10 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${hubType === t ? 'bg-[#10b981] text-[#020617] shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-12">
              <section className="space-y-6">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Primary Specs</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Venue Callsign (Name)</label>
                    <input type="text" placeholder="e.g., G-FORCE ARENA" value={venueName} onChange={(e) => setVenueName(e.target.value)} className="w-full bg-[#020617] border border-slate-800 rounded-2xl py-5 px-6 outline-none focus:border-emerald-500 text-white font-bold transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">UPI Payment ID</label>
                    <input type="text" placeholder="owner@upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="w-full bg-[#020617] border border-emerald-500/30 rounded-2xl py-5 px-6 outline-none focus:border-emerald-500 text-emerald-400 font-black tracking-[0.1em]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Location Coordinates (Address)</label>
                    <textarea rows={3} placeholder="Full address..." value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-[#020617] border border-slate-800 rounded-2xl py-5 px-6 outline-none focus:border-emerald-500 text-white font-bold resize-none" />
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Visual Assets (Photos)</h3>
                  <button onClick={handleAddImage} className="text-emerald-500 text-[10px] font-black uppercase hover:text-emerald-400">+ Add Link</button>
                </div>
                <div className="space-y-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="flex gap-4">
                      <input type="text" placeholder="https://image-url.jpg" value={img} onChange={(e) => handleUpdateImage(idx, e.target.value)} className="flex-1 bg-[#020617] border border-slate-800 rounded-2xl py-4 px-6 text-[12px] font-medium text-slate-300 outline-none focus:border-emerald-500" />
                      {images.length > 1 && (
                        <button onClick={() => handleRemoveImage(idx)} className="w-14 h-14 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Refuel Station (Food Menu)</h3>
                  <button onClick={handleAddMenuImage} className="text-emerald-500 text-[10px] font-black uppercase hover:text-emerald-400">+ Add Link</button>
                </div>
                <div className="space-y-4">
                  {foodMenu.map((img, idx) => (
                    <div key={idx} className="flex gap-4">
                      <input type="text" placeholder="https://menu-photo.jpg" value={img} onChange={(e) => handleUpdateMenuImage(idx, e.target.value)} className="flex-1 bg-[#020617] border border-slate-800 rounded-2xl py-4 px-6 text-[12px] font-medium text-slate-300 outline-none focus:border-emerald-500" />
                      <button onClick={() => handleRemoveMenuImage(idx)} className="w-14 h-14 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-12">
               <section className="space-y-6">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Intel & Comms</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Hotline (Phone)</label>
                      <input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full bg-[#020617] border border-slate-800 rounded-2xl py-4 px-6 outline-none focus:border-emerald-500 text-white font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Official Email</label>
                      <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full bg-[#020617] border border-slate-800 rounded-2xl py-4 px-6 outline-none focus:border-emerald-500 text-white font-bold" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Arena Overview</label>
                    <textarea rows={6} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-[#020617] border border-slate-800 rounded-2xl py-5 px-6 outline-none focus:border-emerald-500 text-white font-medium resize-none" />
                  </div>
                </div>
              </section>
            </div>
          </div>

          <section className="pt-12 border-t border-slate-800 space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <h3 className="text-4xl font-black uppercase tracking-tighter">{hubType === 'TURF' ? 'Time Matrix' : 'Category Matrix'}</h3>
              {hubType === 'GAMING CAFE' && (
                <button onClick={handleAddCategory} className="bg-emerald-500 text-[#020617] px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.05] transition-all shadow-lg shadow-emerald-500/20">+ Add New Category</button>
              )}
            </div>

            {hubType === 'TURF' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {turfSlots.map(s => (
                  <div key={s.id} className="bg-[#020617] border border-slate-800 p-8 rounded-[40px] space-y-6 hover:border-emerald-500/40 transition-all relative group">
                    <button onClick={() => handleRemoveTurfSlot(s.id)} className="absolute top-4 right-4 text-slate-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <input value={s.time} onChange={(e) => handleUpdateTurfSlot(s.id, 'time', e.target.value)} className="w-full bg-transparent border-none text-2xl font-black text-white outline-none" />
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-emerald-400">₹</span>
                      <input value={s.price} onChange={(e) => handleUpdateTurfSlot(s.id, 'price', e.target.value)} className="w-full bg-transparent border-none text-4xl font-black text-emerald-400 outline-none" />
                    </div>
                  </div>
                ))}
                <button onClick={handleAddTurfSlot} className="border-2 border-dashed border-slate-800 rounded-[40px] flex flex-col items-center justify-center p-12 text-slate-700 hover:text-emerald-500 transition-all group">
                   <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-500 transition-all">+</div>
                   <span className="text-[10px] font-black uppercase tracking-widest">Add Slot</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-12">
                {categories.map(cat => (
                  <div key={cat.id} className="bg-[#020617] border border-slate-800 rounded-[50px] p-10 space-y-10 relative group shadow-xl">
                    <button onClick={() => handleRemoveCategory(cat.id)} className="absolute top-8 right-8 text-slate-700 hover:text-red-500 flex items-center gap-2 text-[10px] font-black uppercase transition-all">
                      Delete Tier <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>

                    <div className="grid md:grid-cols-3 gap-10 border-b border-slate-800/50 pb-8">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Category Designation</label>
                         <input value={cat.name} onChange={(e) => handleUpdateCategory(cat.id, 'name', e.target.value)} placeholder="e.g., PS5, VIP PC" className="w-full bg-transparent border-none text-3xl font-black text-white outline-none" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Total Unit Supply (Quantity)</label>
                         <input type="number" value={cat.totalUnits} onChange={(e) => handleUpdateCategory(cat.id, 'totalUnits', e.target.value)} className="w-full bg-transparent border-none text-3xl font-black text-white outline-none" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Price per Hour (₹)</label>
                         <input type="number" value={cat.pricePerHour} onChange={(e) => handleUpdateCategory(cat.id, 'pricePerHour', e.target.value)} className="w-full bg-transparent border-none text-3xl font-black text-emerald-400 outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                      {cat.slots.map(s => (
                        <div key={s.id} className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-[32px] relative group/slot transition-all hover:bg-slate-900">
                           <button onClick={() => handleRemoveSlotFromCategory(cat.id, s.id)} className="absolute top-3 right-3 text-slate-700 hover:text-red-500 opacity-0 group-hover/slot:opacity-100">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg>
                           </button>
                           <input value={s.time} onChange={(e) => handleUpdateCategorySlot(cat.id, s.id, 'time', e.target.value)} className="w-full bg-transparent border-none text-[13px] font-black text-slate-400 outline-none" />
                           <div className="flex items-center gap-1 mt-2">
                              <span className="text-emerald-500 font-black text-lg">₹</span>
                              <input value={s.price} onChange={(e) => handleUpdateCategorySlot(cat.id, s.id, 'price', e.target.value)} className="w-full bg-transparent border-none text-2xl font-black text-white outline-none" />
                           </div>
                        </div>
                      ))}
                      <button onClick={() => handleAddSlotToCategory(cat.id)} className="border border-dashed border-slate-800 rounded-[32px] flex items-center justify-center p-6 text-[10px] font-black uppercase text-slate-700 hover:text-emerald-500 transition-all">+ Add Slot</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <footer className="flex flex-col md:flex-row gap-8 pt-12 border-t border-slate-800">
            <button onClick={onBack} className="flex-1 py-6 border border-slate-800 rounded-3xl font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all">Abort</button>
            <button onClick={handleLaunch} className="flex-1 py-6 bg-emerald-500 text-[#020617] rounded-3xl font-black uppercase tracking-widest text-xl hover:scale-[1.02] shadow-xl transition-all">Confirm Deployment</button>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default HubRegisterView;