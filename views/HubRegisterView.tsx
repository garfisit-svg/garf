
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Hub } from '../types';

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
}

const HubRegisterView: React.FC<HubRegisterViewProps> = ({ onBack, onLogout, onNavigateHome, hubToEdit }) => {
  const [hubType, setHubType] = useState<'TURF' | 'GAMING CAFE'>('TURF');
  const [venueName, setVenueName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  
  // State for Turf slots
  const [turfSlots, setTurfSlots] = useState<SlotData[]>([
    { id: 'ts1', start: '16:00', end: '17:00', price: '1200' }
  ]);

  // State for Gaming Cafe accessories and their slots
  const [accessories, setAccessories] = useState<AccessoryData[]>([
    { 
      id: '1', 
      name: '', 
      slots: [{ id: 's1', start: '18:00', end: '19:00', price: '1200' }] 
    }
  ]);

  useEffect(() => {
    if (hubToEdit) {
      setHubType(hubToEdit.type);
      setVenueName(hubToEdit.name);
      setAddress(hubToEdit.location);
      
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
    setTurfSlots([...turfSlots, { 
      id: Date.now().toString(), 
      start: '00:00', 
      end: '00:00', 
      price: '1000' 
    }]);
  };

  const removeTurfSlot = (id: string) => {
    if (turfSlots.length > 1) {
      setTurfSlots(turfSlots.filter(s => s.id !== id));
    }
  };

  const addAccessory = () => {
    setAccessories([...accessories, { 
      id: Date.now().toString(), 
      name: '', 
      slots: [{ id: Date.now() + 's', start: '09:00', end: '10:00', price: '1000' }] 
    }]);
  };

  const removeAccessory = (id: string) => {
    setAccessories(accessories.filter(a => a.id !== id));
  };

  const addAccessorySlot = (accId: string) => {
    setAccessories(accessories.map(a => {
      if (a.id === accId) {
        return {
          ...a,
          slots: [...a.slots, { id: Date.now().toString(), start: '00:00', end: '00:00', price: '0' }]
        };
      }
      return a;
    }));
  };

  const removeAccessorySlot = (accId: string, slotId: string) => {
    setAccessories(accessories.map(a => {
      if (a.id === accId) {
        return { ...a, slots: a.slots.filter(s => s.id !== slotId) };
      }
      return a;
    }));
  };

  const updateTurfSlot = (id: string, field: keyof SlotData, value: string) => {
    setTurfSlots(turfSlots.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Navbar role="owner" onLogout={onLogout} onNavigateHome={onNavigateHome} />
      
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-[#0b1120] border border-slate-800 rounded-[48px] overflow-hidden shadow-2xl flex flex-col min-h-[80vh]">
          <div className="p-12 pb-8">
            <h1 className="text-6xl font-black text-white tracking-tighter uppercase">
              {hubToEdit ? 'Edit Hub' : 'Register Hub'}
            </h1>
          </div>
          
          <div className="flex-1 p-12 pt-4 space-y-12 overflow-y-auto max-h-[70vh] no-scrollbar">
            {/* Top Grid: Venue Name, Genre, Address, Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="space-y-4">
                <label className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] block">Venue Name</label>
                <input 
                  type="text" 
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="Neon Gaming Hub" 
                  className="w-full bg-[#020617]/40 border border-slate-800 rounded-2xl py-6 px-8 outline-none focus:border-[#10b981] transition-all text-white font-semibold text-lg" 
                />
              </div>

              <div className="space-y-4">
                <label className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] block">Genre</label>
                <div className="relative">
                  <select 
                    value={hubType === 'TURF' ? 'Sports Turf' : 'Gaming Cafe'}
                    onChange={(e) => setHubType(e.target.value === 'Sports Turf' ? 'TURF' : 'GAMING CAFE')}
                    className="w-full bg-[#020617]/40 border border-slate-800 rounded-2xl py-6 px-8 outline-none focus:border-[#10b981] transition-all text-white font-semibold text-lg appearance-none cursor-pointer"
                  >
                    <option className="bg-[#0b1120]">Sports Turf</option>
                    <option className="bg-[#0b1120]">Gaming Cafe</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] block">Location Address</label>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Mumbai, Maharashtra" 
                  className="w-full bg-[#020617]/40 border border-slate-800 rounded-2xl py-6 px-8 outline-none focus:border-[#10b981] transition-all text-white font-semibold text-lg" 
                />
              </div>

              <div className="space-y-4">
                <label className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] block invisible md:visible">&nbsp;</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX" 
                  className="w-full bg-[#020617]/40 border border-slate-800 rounded-2xl py-6 px-8 outline-none focus:border-[#10b981] transition-all text-white font-semibold text-lg" 
                />
              </div>
            </div>

            {/* Hub Gallery */}
            <div className="space-y-6 pt-4">
              <label className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] block">Hub Gallery (Image URLs)</label>
              <div className="h-px bg-slate-800/60"></div>
              <button className="text-[#10b981] font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-opacity">
                + ADD IMAGE URL
              </button>
            </div>

            {/* Amenities & Rules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
              <div className="space-y-6">
                <label className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] block">Amenities</label>
                <div className="h-px bg-slate-800/60"></div>
                <button className="text-[#10b981] font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-opacity">
                  + ADD AMENITY
                </button>
              </div>
              <div className="space-y-6">
                <label className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] block">Rules / Guidelines</label>
                <div className="h-px bg-slate-800/60"></div>
                <button className="text-[#10b981] font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-opacity">
                  + ADD RULE
                </button>
              </div>
            </div>

            {/* Slots / Accessories Section */}
            <div className="pt-8 space-y-8 pb-12">
              <div className="flex items-center justify-between">
                <label className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em]">
                  {hubType === 'TURF' ? 'Turf Time Slots' : 'Accessories & Gear'}
                </label>
                <button 
                  onClick={hubType === 'TURF' ? addTurfSlot : addAccessory}
                  className="text-[#10b981] font-black text-xs uppercase tracking-widest hover:text-emerald-400 transition-colors"
                >
                  {hubType === 'TURF' ? '+ ADD SLOT' : '+ ADD ACCESSORY'}
                </button>
              </div>

              {hubType === 'TURF' ? (
                <div className="bg-[#020617]/30 border border-slate-800 rounded-[32px] p-8 space-y-4">
                  {turfSlots.map((slot) => (
                    <div key={slot.id} className="flex items-center gap-6 bg-[#0b1120] border border-slate-800 rounded-3xl p-5 max-w-2xl animate-in zoom-in-95 duration-200">
                      <div className="flex-1 flex items-center gap-6">
                        <div className="flex items-center gap-3">
                          <input 
                            type="text" 
                            value={slot.start} 
                            onChange={(e) => updateTurfSlot(slot.id, 'start', e.target.value)}
                            className="bg-transparent text-white font-black text-xl w-16 outline-none focus:text-[#10b981]" 
                          />
                          <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="text-slate-700 font-black uppercase text-[10px] tracking-widest">To</span>
                        <div className="flex items-center gap-3">
                          <input 
                            type="text" 
                            value={slot.end} 
                            onChange={(e) => updateTurfSlot(slot.id, 'end', e.target.value)}
                            className="bg-transparent text-white font-black text-xl w-16 outline-none focus:text-[#10b981]" 
                          />
                          <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-[#020617] border border-slate-800 rounded-2xl px-6 py-3">
                        <span className="text-[#10b981] font-black text-lg">₹</span>
                        <input 
                          type="text" 
                          value={slot.price} 
                          onChange={(e) => updateTurfSlot(slot.id, 'price', e.target.value)}
                          className="w-16 bg-transparent text-white font-black text-lg outline-none" 
                        />
                      </div>
                      <button 
                        onClick={() => removeTurfSlot(slot.id)}
                        className="text-slate-700 hover:text-red-400 transition-colors p-2"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {accessories.map((acc) => (
                    <div key={acc.id} className="bg-[#020617]/30 border border-slate-800 rounded-[40px] p-8 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-6">
                        <input 
                          type="text" 
                          placeholder="Gear Name (e.g. PC-1, PS5 Room)" 
                          className="flex-1 bg-[#0b1120] border border-slate-800 rounded-3xl py-7 px-10 text-white text-xl font-black outline-none focus:border-slate-600 transition-all placeholder:text-slate-700" 
                          value={acc.name}
                          onChange={(e) => {
                            setAccessories(accessories.map(a => a.id === acc.id ? { ...a, name: e.target.value } : a));
                          }}
                        />
                        <button 
                          onClick={() => removeAccessory(acc.id)}
                          className="w-20 h-20 bg-red-900/10 text-red-500 border border-red-900/20 rounded-3xl flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-transparent transition-all"
                        >
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">Slots for this accessory</p>
                          <button 
                            onClick={() => addAccessorySlot(acc.id)}
                            className="text-[#10b981] font-black text-[11px] uppercase tracking-widest flex items-center gap-2"
                          >
                            + NEW SLOT
                          </button>
                        </div>

                        {acc.slots.map((slot) => (
                          <div key={slot.id} className="flex items-center gap-6 bg-[#0b1120] border border-slate-800 rounded-[28px] p-5 animate-in zoom-in-95 duration-200">
                            <div className="flex-1 flex items-center gap-8 pl-4">
                              <div className="flex items-center gap-3">
                                <span className="text-white font-black text-xl">{slot.start}</span>
                                <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <span className="text-slate-700 font-black uppercase text-[10px] tracking-widest">To</span>
                              <div className="flex items-center gap-3">
                                <span className="text-white font-black text-xl">{slot.end}</span>
                                <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 bg-[#020617] border border-slate-800 rounded-2xl px-7 py-3">
                              <span className="text-[#10b981] font-black text-lg">₹</span>
                              <input type="text" defaultValue={slot.price} className="w-16 bg-transparent text-white font-black text-lg outline-none" />
                            </div>

                            <button 
                              onClick={() => removeAccessorySlot(acc.id, slot.id)}
                              className="text-slate-700 hover:text-red-400 transition-colors p-2"
                            >
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-12 bg-slate-900/10 border-t border-slate-800 flex gap-6 mt-auto">
            <button 
              onClick={onBack} 
              className="flex-1 py-7 bg-transparent border border-slate-800 text-slate-400 font-black rounded-[32px] hover:bg-slate-800/50 hover:text-white transition-all uppercase tracking-[0.25em] text-sm"
            >
              Discard
            </button>
            <button 
              onClick={() => {
                alert(hubToEdit ? 'Hub Updated Successfully!' : 'Hub Launched Successfully!');
                onBack();
              }}
              className="flex-[2] py-7 bg-[#10b981] hover:bg-[#34d399] text-[#020617] font-black rounded-[32px] transition-all shadow-[0_8px_32px_rgba(16,185,129,0.3)] uppercase tracking-[0.25em] text-sm"
            >
              {hubToEdit ? 'Save Changes' : 'Launch Hub'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HubRegisterView;
