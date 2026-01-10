import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Hub, Accessory, TimeSlot } from '../types';

interface SlotData {
  id: string;
  start: string;
  end: string;
  price: string;
}

interface AccessoryData {
  id: string;
  name: string;
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
  const [imagesInput, setImagesInput] = useState('');
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  
  const [turfSlots, setTurfSlots] = useState<SlotData[]>([
    { id: 'ts1', start: '16:00', end: '17:00', price: '1200' }
  ]);

  const [accessories, setAccessories] = useState<AccessoryData[]>([
    { 
      id: 'acc' + Date.now(), 
      name: 'Standard PC', 
      slots: [{ id: 's' + Date.now(), start: '18:00', end: '19:00', price: '100' }] 
    }
  ]);

  useEffect(() => {
    if (hubToEdit) {
      setHubType(hubToEdit.type);
      setVenueName(hubToEdit.name);
      setAddress(hubToEdit.location);
      setImagesInput(hubToEdit.images.join(', '));
      setDescription(hubToEdit.description);
      setContactPhone(hubToEdit.contactPhone || '');
      setContactEmail(hubToEdit.contactEmail || '');
      
      if (hubToEdit.type === 'TURF') {
        setTurfSlots(hubToEdit.slots.map(s => ({
          id: s.id,
          start: s.time.split(' - ')[0] || s.time,
          end: s.time.split(' - ')[1] || '',
          price: s.price.toString()
        })));
      } else if (hubToEdit.accessories) {
        setAccessories(hubToEdit.accessories.map(acc => ({
          id: acc.id,
          name: acc.name,
          slots: acc.slots.map(s => ({
            id: s.id,
            start: s.time.split(' - ')[0] || s.time,
            end: s.time.split(' - ')[1] || '',
            price: s.price.toString()
          }))
        })));
      }
    }
  }, [hubToEdit]);

  const addTurfSlot = () => {
    setTurfSlots([...turfSlots, { id: 'ts' + Date.now(), start: '00:00', end: '00:00', price: '1000' }]);
  };

  const removeTurfSlot = (id: string) => {
    if (turfSlots.length > 1) setTurfSlots(turfSlots.filter(s => s.id !== id));
  };

  const addAccessory = () => {
    setAccessories([...accessories, { 
      id: 'acc' + Date.now(), 
      name: '', 
      slots: [{ id: 's' + Date.now(), start: '09:00', end: '10:00', price: '100' }] 
    }]);
  };

  const removeAccessory = (id: string) => {
    setAccessories(accessories.filter(a => a.id !== id));
  };

  const addAccessorySlot = (accId: string) => {
    setAccessories(accessories.map(a => 
      a.id === accId 
        ? { ...a, slots: [...a.slots, { id: 's' + Date.now(), start: '00:00', end: '00:00', price: '0' }] } 
        : a
    ));
  };

  const removeAccessorySlot = (accId: string, slotId: string) => {
    setAccessories(accessories.map(a => 
      a.id === accId 
        ? { ...a, slots: a.slots.filter(s => s.id !== slotId) } 
        : a
    ));
  };

  const updateTurfSlot = (id: string, field: keyof SlotData, value: string) => {
    setTurfSlots(turfSlots.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const updateAccessorySlot = (accId: string, slotId: string, field: keyof SlotData, value: string) => {
    setAccessories(accessories.map(a => 
      a.id === accId 
        ? { ...a, slots: a.slots.map(s => s.id === slotId ? { ...s, [field]: value } : s) } 
        : a
    ));
  };

  const handleLaunch = () => {
    if (!venueName || !address || !contactPhone || !contactEmail) {
      alert("Please fill in all identity and contact details.");
      return;
    }

    const images = imagesInput.split(',').map(url => url.trim()).filter(url => url !== '');
    if (images.length === 0) {
      images.push('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200');
    }

    const finalSlots: TimeSlot[] = turfSlots.map(ts => ({
      id: ts.id,
      time: ts.end ? `${ts.start} - ${ts.end}` : ts.start,
      price: parseInt(ts.price) || 0,
      available: true
    }));

    const finalAccessories: Accessory[] = accessories.map(acc => ({
      id: acc.id,
      name: acc.name || 'Unnamed Gear',
      type: 'PC',
      slots: acc.slots.map(s => ({
        id: s.id,
        time: s.end ? `${s.start} - ${s.end}` : s.start,
        price: parseInt(s.price) || 0,
        available: true
      }))
    }));

    const newHub: Hub = {
      id: hubToEdit?.id || 'hub-' + Date.now(),
      name: venueName,
      type: hubType,
      location: address,
      rating: hubToEdit?.rating || 5.0,
      images: images,
      priceStart: hubType === 'TURF' ? (finalSlots[0]?.price || 0) : (finalAccessories[0]?.slots[0]?.price || 0),
      description: description || `Premium ${hubType.toLowerCase()} experience in ${address}.`,
      amenities: hubToEdit?.amenities || ['Parking', 'Drinking Water', 'Floodlights'],
      slots: hubType === 'TURF' ? finalSlots : [],
      accessories: hubType === 'GAMING CAFE' ? finalAccessories : undefined,
      isBestSeller: hubToEdit?.isBestSeller || false,
      contactPhone,
      contactEmail,
      reviews: hubToEdit?.reviews || []
    };

    onSave(newHub);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Navbar role="owner" onLogout={onLogout} onNavigateHome={onNavigateHome} />
      
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-[#0b1120] border border-slate-800 rounded-[48px] overflow-hidden shadow-2xl flex flex-col min-h-[80vh]">
          <div className="p-12 pb-8 border-b border-slate-800/50">
            <h1 className="text-6xl font-black text-white tracking-tighter uppercase mb-2">
              {hubToEdit ? 'Edit Arena' : 'New Arena Intel'}
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Enter comprehensive venue details for public listing</p>
          </div>
          
          <div className="flex-1 p-12 pt-10 space-y-16 overflow-y-auto max-h-[70vh] no-scrollbar">
            {/* Section 1: Core Identity */}
            <section className="space-y-10">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[#10b981] rounded-full"></div>
                <h3 className="text-xl font-black uppercase tracking-tight">Core Identity</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="space-y-4">
                  <label className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] block">Official Venue Name</label>
                  <input type="text" value={venueName} onChange={(e) => setVenueName(e.target.value)} placeholder="Neon Gaming Hub" className="w-full bg-[#020617]/40 border border-slate-800 rounded-2xl py-6 px-8 outline-none focus:border-[#10b981] transition-all text-white font-semibold text-lg" />
                </div>
                <div className="space-y-4">
                  <label className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] block">Venue Type</label>
                  <div className="relative">
                    <select value={hubType} onChange={(e) => setHubType(e.target.value as any)} className="w-full bg-[#020617]/40 border border-slate-800 rounded-2xl py-6 px-8 outline-none focus:border-[#10b981] transition-all text-white font-semibold text-lg appearance-none cursor-pointer">
                      <option value="TURF" className="bg-[#0b1120]">Sports Turf</option>
                      <option value="GAMING CAFE" className="bg-[#0b1120]">Gaming Cafe</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4 col-span-full">
                  <label className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] block">Full Address & Location</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. 123 Cyber St, Mumbai, Maharashtra" className="w-full bg-[#020617]/40 border border-slate-800 rounded-2xl py-6 px-8 outline-none focus:border-[#10b981] transition-all text-white font-semibold text-lg" />
                </div>
              </div>
            </section>

            {/* Section 2: Contact & Reach */}
            <section className="space-y-10 bg-[#020617]/20 p-10 rounded-[40px] border border-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                <h3 className="text-xl font-black uppercase tracking-tight">Business Contact Intel</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="space-y-4">
                  <label className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] block">Official Phone No.</label>
                  <input 
                    type="tel" 
                    value={contactPhone} 
                    onChange={(e) => setContactPhone(e.target.value)} 
                    placeholder="+91 00000 00000" 
                    className="w-full bg-[#020617]/40 border border-slate-800 rounded-2xl py-6 px-8 outline-none focus:border-blue-500 transition-all text-white font-semibold text-lg" 
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] block">Official Business Email</label>
                  <input 
                    type="email" 
                    value={contactEmail} 
                    onChange={(e) => setContactEmail(e.target.value)} 
                    placeholder="contact@venue.com" 
                    className="w-full bg-[#020617]/40 border border-slate-800 rounded-2xl py-6 px-8 outline-none focus:border-blue-500 transition-all text-white font-semibold text-lg" 
                  />
                </div>
              </div>
            </section>

            {/* Section 3: Visuals & Narrative */}
            <section className="space-y-10">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                <h3 className="text-xl font-black uppercase tracking-tight">Visuals & Branding</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="space-y-4 col-span-full">
                  <label className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] block">Gallery Image URLs (Comma Separated)</label>
                  <textarea 
                    rows={3}
                    value={imagesInput} 
                    onChange={(e) => setImagesInput(e.target.value)} 
                    placeholder="https://img1.com, https://img2.com..." 
                    className="w-full bg-[#020617]/40 border border-slate-800 rounded-2xl py-6 px-8 outline-none focus:border-[#10b981] transition-all text-white font-semibold text-lg resize-none" 
                  />
                </div>
                <div className="space-y-4 col-span-full">
                  <label className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] block">Arena Description</label>
                  <textarea 
                    rows={4} 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Describe the premium experience at your venue..." 
                    className="w-full bg-[#020617]/40 border border-slate-800 rounded-2xl py-6 px-8 outline-none focus:border-[#10b981] transition-all text-white font-semibold text-lg resize-none" 
                  />
                </div>
              </div>
            </section>

            {/* Section 4: Slots & Inventory */}
            <section className="pt-8 space-y-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
                  <h3 className="text-xl font-black uppercase tracking-tight">
                    {hubType === 'TURF' ? 'Time Slot Architecture' : 'Gear & Inventory Management'}
                  </h3>
                </div>
                <button 
                  onClick={hubType === 'TURF' ? addTurfSlot : addAccessory} 
                  className="bg-[#10b981]/10 text-[#10b981] px-6 py-3 rounded-xl border border-[#10b981]/30 font-black text-[10px] uppercase tracking-widest hover:bg-[#10b981] hover:text-[#020617] transition-all"
                >
                  {hubType === 'TURF' ? '+ New Time Slot' : '+ New Gear Unit'}
                </button>
              </div>

              {hubType === 'TURF' ? (
                <div className="bg-[#020617]/30 border border-slate-800 rounded-[32px] p-8 space-y-4">
                  {turfSlots.map((slot) => (
                    <div key={slot.id} className="flex items-center gap-6 bg-[#0b1120] border border-slate-800 rounded-3xl p-5">
                      <div className="flex-1 flex items-center gap-6">
                        <div className="space-y-1">
                          <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Start</p>
                          <input type="text" value={slot.start} onChange={(e) => updateTurfSlot(slot.id, 'start', e.target.value)} className="bg-transparent text-white font-black text-xl w-16 outline-none focus:text-[#10b981]" />
                        </div>
                        <span className="text-slate-700 font-black uppercase text-[10px] tracking-widest pt-4">To</span>
                        <div className="space-y-1">
                          <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">End</p>
                          <input type="text" value={slot.end} onChange={(e) => updateTurfSlot(slot.id, 'end', e.target.value)} className="bg-transparent text-white font-black text-xl w-16 outline-none focus:text-[#10b981]" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-[#020617] border border-slate-800 rounded-2xl px-6 py-3">
                        <span className="text-[#10b981] font-black text-lg">₹</span>
                        <input type="text" value={slot.price} onChange={(e) => updateTurfSlot(slot.id, 'price', e.target.value)} className="w-16 bg-transparent text-white font-black text-lg outline-none" />
                      </div>
                      <button onClick={() => removeTurfSlot(slot.id)} className="text-slate-700 hover:text-red-400 transition-colors p-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-10">
                  {accessories.map((acc) => (
                    <div key={acc.id} className="bg-[#020617]/30 border border-slate-800 rounded-[48px] p-10 space-y-8 relative group/card">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1 flex items-center gap-6">
                          <div className="bg-blue-600/10 text-blue-500 px-4 py-2 rounded-xl border border-blue-600/20 text-[10px] font-black tracking-widest">UNIT CONFIG</div>
                          <input 
                            type="text" 
                            placeholder="Gear ID (e.g. RTX-PC-01)" 
                            className="flex-1 bg-transparent text-3xl font-black text-white outline-none border-b border-transparent focus:border-blue-500 transition-all placeholder:text-slate-800" 
                            value={acc.name} 
                            onChange={(e) => setAccessories(accessories.map(a => a.id === acc.id ? { ...a, name: e.target.value } : a))} 
                          />
                        </div>
                        <button 
                          onClick={() => removeAccessory(acc.id)} 
                          className="w-12 h-12 bg-red-900/10 text-red-500 border border-red-900/20 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all ml-4"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" /></svg>
                        </button>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Available Time Blocks</p>
                          <button 
                            onClick={() => addAccessorySlot(acc.id)} 
                            className="text-emerald-400 font-black text-[10px] uppercase tracking-widest hover:text-emerald-300 transition-colors flex items-center gap-2"
                          >
                            <span className="text-lg">+</span> Add Time Slot
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {acc.slots.map((slot) => (
                            <div key={slot.id} className="bg-[#0b1120] border border-slate-800 rounded-[28px] p-6 flex items-center justify-between group/slot hover:border-slate-600 transition-all">
                              <div className="flex items-center gap-4">
                                <div className="space-y-1">
                                  <input 
                                    type="text" 
                                    value={slot.start} 
                                    onChange={(e) => updateAccessorySlot(acc.id, slot.id, 'start', e.target.value)} 
                                    className="bg-transparent text-white font-black text-lg w-16 outline-none focus:text-blue-400" 
                                  />
                                </div>
                                <span className="text-slate-700 font-black text-xs">→</span>
                                <div className="space-y-1">
                                  <input 
                                    type="text" 
                                    value={slot.end} 
                                    onChange={(e) => updateAccessorySlot(acc.id, slot.id, 'end', e.target.value)} 
                                    className="bg-transparent text-white font-black text-lg w-16 outline-none focus:text-blue-400" 
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="bg-[#020617] px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-2">
                                  <span className="text-emerald-400 font-black text-sm">₹</span>
                                  <input 
                                    type="text" 
                                    value={slot.price} 
                                    onChange={(e) => updateAccessorySlot(acc.id, slot.id, 'price', e.target.value)} 
                                    className="w-12 bg-transparent text-white font-black text-sm outline-none" 
                                  />
                                </div>
                                <button 
                                  onClick={() => removeAccessorySlot(acc.id, slot.id)} 
                                  className="p-2 text-slate-700 hover:text-red-500 transition-colors opacity-0 group-hover/slot:opacity-100"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="p-12 bg-slate-900/10 border-t border-slate-800 flex gap-6 mt-auto">
            <button onClick={onBack} className="flex-1 py-7 bg-transparent border border-slate-800 text-slate-400 font-black rounded-[32px] hover:bg-slate-800/50 hover:text-white transition-all uppercase tracking-[0.25em] text-sm">Discard Changes</button>
            <button onClick={handleLaunch} className="flex-[2] py-7 bg-[#10b981] hover:bg-[#34d399] text-[#020617] font-black rounded-[32px] transition-all shadow-[0_8px_32px_rgba(16,185,129,0.3)] uppercase tracking-[0.25em] text-sm">
              {hubToEdit ? 'Save Data' : 'Launch Listing'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HubRegisterView;