import React, { useState, useEffect } from 'react';
import { UserRole, Hub, Booking, ChatRoom, ChatMessage } from './types';
import LandingView from './views/LandingView';
import AuthView from './views/AuthView';
import UserDashboard from './views/UserDashboard';
import HubDetailView from './views/HubDetailView';
import OwnerDashboard from './views/OwnerDashboard';
import HubRegisterView from './views/HubRegisterView';
import { getAIScoutResponse } from './services/aiService';
import { supabase } from './services/supabase';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'auth' | 'user' | 'owner' | 'hub-detail' | 'hub-register'>('landing');
  const [authType, setAuthType] = useState<UserRole>('user');
  const [selectedHub, setSelectedHub] = useState<Hub | null>(null);
  const [editingHub, setEditingHub] = useState<Hub | null>(null);
  const [userNickname, setUserNickname] = useState<string>('Player One');
  
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([
    {
      id: 'global',
      name: 'Global Arena Chat',
      description: 'The main hub for finding players and general discussion.',
      isGlobal: true,
      messages: []
    },
    {
      id: 'ai-scout',
      name: 'Tactical AI Scout',
      description: 'Direct comms with Garf intelligence for hub recommendations.',
      isGlobal: true,
      messages: [
        { id: 'ai1', senderNickname: 'AI_SCOUT', text: 'Unit active. I can help you find the perfect turf or gaming station. What are your parameters?', timestamp: Date.now(), type: 'text' }
      ]
    }
  ]);

  const [ownerHubIds, setOwnerHubIds] = useState<Set<string>>(new Set());

  // REAL DATA FETCHING
  useEffect(() => {
    const fetchData = async () => {
      // If using placeholder keys, we skip fetching to avoid repeated console errors
      // @ts-ignore - access to protected property for check
      if (supabase.supabaseUrl.includes('placeholder-please-set-your-url')) {
        setIsLoading(false);
        console.warn("Supabase keys not detected. Running in offline/demo mode.");
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch Hubs from Supabase
        const { data: hubsData, error: hubsError } = await supabase
          .from('hubs')
          .select('*');

        if (hubsError) throw hubsError;

        if (hubsData) {
          const formattedHubs: Hub[] = hubsData.map(h => ({
            ...h,
            priceStart: h.price_start,
            isSoldOut: h.is_sold_out,
            contactPhone: h.contact_phone,
            contactEmail: h.contact_email,
            slots: h.slots || [],
          }));
          setHubs(formattedHubs);
        }

        // Fetch Bookings
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('*');
        
        if (bookingsError) throw bookingsError;

        if (bookingsData) {
          setBookings(bookingsData as any);
        }
      } catch (err: any) {
        console.error("Data fetch failed:", err);
        setError("Satellite link unstable. Please check your connection or project configuration.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [view]);

  // REAL-TIME CHAT
  useEffect(() => {
    // @ts-ignore
    if (supabase.supabaseUrl.includes('placeholder-please-set-your-url')) return;

    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        const newMessage = payload.new as any;
        setChatRooms(prev => prev.map(room => 
          room.id === newMessage.room_id 
            ? { ...room, messages: [...room.messages, { ...newMessage, id: 'db-' + newMessage.id, timestamp: new Date(newMessage.timestamp).getTime(), type: 'text' }] }
            : room
        ));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAuthSuccess = (nickname?: string) => {
    if (nickname) setUserNickname(nickname);
    else if (authType === 'owner') setUserNickname('System Owner'); 
    setView(authType === 'owner' ? 'owner' : 'user');
  };

  const handleSendMessage = async (roomId: string, message: Partial<ChatMessage>) => {
    const tempId = 'temp-' + Date.now();
    
    // Optimistic update for UI feel
    if (roomId !== 'ai-scout') {
        const optimisticMsg: ChatMessage = {
            id: tempId,
            senderNickname: userNickname,
            text: message.text,
            timestamp: Date.now(),
            type: 'text'
        } as ChatMessage;
        
        setChatRooms(prev => prev.map(room => 
            room.id === roomId ? { ...room, messages: [...room.messages, optimisticMsg] } : room
        ));
    }

    // Persist to Supabase if keys exist
    // @ts-ignore
    if (!supabase.supabaseUrl.includes('placeholder-please-set-your-url')) {
      const { error } = await supabase
        .from('messages')
        .insert([
          { 
            room_id: roomId, 
            sender_nickname: userNickname, 
            text: message.text 
          }
        ]);
      if (error) console.error("Message transmission failure:", error);
    }

    // AI logic
    if (roomId === 'ai-scout' && message.text) {
      const aiResponseText = await getAIScoutResponse(message.text, hubs);
      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        senderNickname: 'AI_SCOUT',
        text: aiResponseText,
        timestamp: Date.now(),
        type: 'text'
      };
      
      setChatRooms(prev => prev.map(room => 
        room.id === 'ai-scout' ? { ...room, messages: [...room.messages, aiMsg] } : room
      ));

      // @ts-ignore
      if (!supabase.supabaseUrl.includes('placeholder-please-set-your-url')) {
        await supabase.from('messages').insert([{
          room_id: 'ai-scout',
          sender_nickname: 'AI_SCOUT',
          text: aiResponseText
        }]);
      }
    }
  };

  const handleHubSelect = (hub: Hub) => { if (!hub.isSoldOut) { setSelectedHub(hub); setView('hub-detail'); } };
  const handleBack = () => setView(authType === 'owner' ? 'owner' : 'user');
  const handleLogout = () => { setView('landing'); setUserNickname('Player One'); };

  const handleCreateBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status' | 'userId' | 'userName'>) => {
    // @ts-ignore
    if (supabase.supabaseUrl.includes('placeholder-please-set-your-url')) {
        // Fallback for demo mode
        const demoBooking: Booking = {
            ...bookingData,
            id: 'demo-' + Date.now(),
            createdAt: Date.now(),
            status: 'confirmed',
            userId: 'demo-user',
            userName: userNickname
        };
        setBookings(prev => [demoBooking, ...prev]);
        setView('user');
        return;
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          hub_id: bookingData.hubId,
          hub_name: bookingData.hubName,
          slot_time: bookingData.slotTime,
          payment_method: bookingData.paymentMethod,
          user_name: userNickname,
          status: bookingData.paymentMethod === 'cash' ? 'pending' : 'confirmed'
        }
      ]);
      
    if (!error) {
      setView('user');
    } else {
        alert("Satellite link error: Could not process booking.");
    }
  };

  if (isLoading && view !== 'landing') {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-emerald-500 font-black uppercase tracking-[0.3em] text-xs">Syncing with Garf Satellite...</p>
        </div>
      </div>
    );
  }

  if (error && view !== 'landing') {
     return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-center">
           <div className="max-w-md space-y-6">
              <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
                 <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h2 className="text-2xl font-black uppercase text-white">Signal Lost</h2>
              <p className="text-slate-400 font-medium">{error}</p>
              <button onClick={() => window.location.reload()} className="px-8 py-3 bg-slate-800 text-white font-black rounded-xl uppercase tracking-widest text-xs">Re-attempt Uplink</button>
           </div>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      {view === 'landing' && <LandingView onStartAuth={(role) => { setAuthType(role); setView('auth'); }} onBrowseGuest={() => setView('user')} />}
      {view === 'auth' && <AuthView type={authType} onBack={() => setView('landing')} onSuccess={handleAuthSuccess} />}
      {view === 'user' && (
        <UserDashboard hubs={hubs} nickname={userNickname} bookings={bookings} chatRooms={chatRooms} onLogout={handleLogout} onHubSelect={handleHubSelect} onNavigateHome={() => setView('user')} onSendMessage={handleSendMessage} onVotePoll={() => {}} onCreateSquad={(name) => { const id = 'sq-' + Date.now(); setChatRooms(prev => [...prev, { id, name, description: 'Squad', isGlobal: false, messages: [] }]); return id; }} onJoinSquad={() => true} />
      )}
      {view === 'hub-detail' && selectedHub && (
        <HubDetailView hub={hubs.find(h => h.id === selectedHub.id) || selectedHub} onBack={handleBack} role={authType} onLogout={handleLogout} onBook={handleCreateBooking} onPostReview={() => {}} />
      )}
      {view === 'owner' && <OwnerDashboard hubs={hubs.filter(h => ownerHubIds.has(h.id))} bookings={bookings.filter(b => ownerHubIds.has(b.hubId))} onUpdateBookingStatus={() => {}} onLogout={handleLogout} onAddHub={() => setView('hub-register')} onEditHub={(h) => { setEditingHub(h); setView('hub-register'); }} onToggleSoldOut={() => {}} onNavigateHome={() => setView('owner')} />}
      {view === 'hub-register' && <HubRegisterView onBack={handleBack} onLogout={handleLogout} onNavigateHome={() => setView('owner')} hubToEdit={editingHub || undefined} onSave={() => setView('owner')} />}
    </div>
  );
};

export default App;
