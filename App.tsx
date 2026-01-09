import React, { useState, useEffect } from 'react';
import { UserRole, Hub, Booking, ChatRoom, ChatMessage } from './types';
import LandingView from './views/LandingView';
import AuthView from './views/AuthView';
import UserDashboard from './views/UserDashboard';
import HubDetailView from './views/HubDetailView';
import OwnerDashboard from './views/OwnerDashboard';
import HubRegisterView from './views/HubRegisterView';
import { supabase, isDemoMode } from './services/supabase';

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
    }
  ]);

  const [ownerHubIds, setOwnerHubIds] = useState<Set<string>>(new Set());

  // REAL DATA FETCHING
  useEffect(() => {
    const fetchData = async () => {
      if (isDemoMode()) {
        setIsLoading(false);
        console.warn("Supabase keys not detected. App running in restricted Demo Mode.");
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const { data: hubsData, error: hubsError } = await supabase
          .from('hubs')
          .select('*');

        if (hubsError) throw hubsError;

        if (hubsData) {
          const formattedHubs: Hub[] = hubsData.map((h: any) => ({
            ...h,
            priceStart: h.price_start,
            isSoldOut: h.is_sold_out,
            contactPhone: h.contact_phone,
            contactEmail: h.contact_email,
            slots: h.slots || [],
          }));
          setHubs(formattedHubs);
        }

        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('*');
        
        if (bookingsError) throw bookingsError;

        if (bookingsData) {
          setBookings(bookingsData as any);
        }
      } catch (err: any) {
        console.error("Data fetch failed:", err);
        setError("Satellite link unstable. Please check your Supabase connection.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [view]);

  // REAL-TIME CHAT
  useEffect(() => {
    if (isDemoMode()) return;

    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload: any) => {
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
    
    // Optimistic local update
    const optimisticMsg: ChatMessage = {
        id: tempId,
        senderNickname: userNickname,
        text: message.text,
        timestamp: Date.now(),
        type: message.type || 'text',
        poll: message.poll
    } as ChatMessage;
    
    setChatRooms(prev => prev.map(room => 
        room.id === roomId ? { ...room, messages: [...room.messages, optimisticMsg] } : room
    ));

    if (!isDemoMode()) {
      const { error } = await supabase
        .from('messages')
        .insert([{ 
          room_id: roomId, 
          sender_nickname: userNickname, 
          text: message.text,
          type: message.type || 'text',
          poll: message.poll ? JSON.stringify(message.poll) : null
        }]);
      if (error) console.error("Persistent storage failed:", error);
    }
  };

  const handleHubSelect = (hub: Hub) => { if (!hub.isSoldOut) { setSelectedHub(hub); setView('hub-detail'); } };
  const handleBack = () => setView(authType === 'owner' ? 'owner' : 'user');
  const handleLogout = () => { setView('landing'); setUserNickname('Player One'); };

  const handleCreateBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status' | 'userId' | 'userName'>) => {
    if (isDemoMode()) {
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

    const { error } = await supabase
      .from('bookings')
      .insert([{
        hub_id: bookingData.hubId,
        hub_name: bookingData.hubName,
        slot_time: bookingData.slotTime,
        payment_method: bookingData.paymentMethod,
        user_name: userNickname,
        status: bookingData.paymentMethod === 'cash' ? 'pending' : 'confirmed'
      }]);
      
    if (!error) {
      setView('user');
    } else {
        alert("Booking failure: Could not link to satellite database.");
    }
  };

  const handleCreateSquad = (name: string) => {
    const id = 'sq-' + Date.now();
    const joinCode = Math.floor(1000 + Math.random() * 9000).toString(); // Generate 4-digit code
    const newRoom: ChatRoom = {
      id,
      name,
      description: `Tactical Squad - Code: ${joinCode}`,
      isGlobal: false,
      messages: [{
        id: 'sys-' + Date.now(),
        senderNickname: 'SYSTEM',
        text: `Squad established. Tactical link code: ${joinCode}`,
        timestamp: Date.now(),
        type: 'text',
        isSystem: true
      }],
      joinCode
    };
    setChatRooms(prev => [...prev, newRoom]);
    return id;
  };

  const handleJoinSquad = (code: string) => {
    const room = chatRooms.find(r => r.joinCode === code);
    if (room) {
      return true; // The UI should then switch to this roomId
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      {view === 'landing' && <LandingView onStartAuth={(role) => { setAuthType(role); setView('auth'); }} onBrowseGuest={() => setView('user')} />}
      {view === 'auth' && <AuthView type={authType} onBack={() => setView('landing')} onSuccess={handleAuthSuccess} />}
      {view === 'user' && (
        <UserDashboard 
          hubs={hubs} 
          nickname={userNickname} 
          bookings={bookings} 
          chatRooms={chatRooms} 
          onLogout={handleLogout} 
          onHubSelect={handleHubSelect} 
          onNavigateHome={() => setView('user')} 
          onSendMessage={handleSendMessage} 
          onVotePoll={() => {}} 
          onCreateSquad={handleCreateSquad} 
          onJoinSquad={handleJoinSquad} 
        />
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