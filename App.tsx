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
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);

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
        // Fetch Hubs
        const { data: hubsData, error: hubsError } = await supabase.from('hubs').select('*');
        if (hubsError) throw hubsError;
        if (hubsData) {
          setHubs(hubsData.map((h: any) => ({
            ...h,
            priceStart: h.price_start,
            isSoldOut: h.is_sold_out,
            contactPhone: h.contact_phone,
            contactEmail: h.contact_email,
            slots: h.slots || [],
          })));
        }

        // Fetch Bookings
        const { data: bookingsData, error: bookingsError } = await supabase.from('bookings').select('*');
        if (bookingsError) throw bookingsError;
        if (bookingsData) setBookings(bookingsData as any);

        // Fetch Chat Rooms (Persistent Squads)
        const { data: roomsData, error: roomsError } = await supabase.from('rooms').select('*');
        if (!roomsError && roomsData) {
          const formattedRooms: ChatRoom[] = await Promise.all(roomsData.map(async (r: any) => {
             const { data: msgs } = await supabase.from('messages').select('*').eq('room_id', r.id).order('timestamp', { ascending: true });
             return {
                id: r.id,
                name: r.name,
                description: r.description,
                isGlobal: r.is_global,
                joinCode: r.join_code,
                messages: (msgs || []).map((m: any) => ({
                  ...m,
                  id: 'db-' + m.id,
                  senderNickname: m.sender_nickname,
                  timestamp: new Date(m.timestamp).getTime()
                }))
             };
          }));
          setChatRooms(formattedRooms);
        } else {
           // Fallback to local if table doesn't exist yet
           setChatRooms([{ id: 'global', name: 'Global Arena Chat', description: 'Main hub.', isGlobal: true, messages: [] }]);
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

  // REAL-TIME CHAT SYNC
  useEffect(() => {
    if (isDemoMode()) return;

    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload: any) => {
        const newMessage = payload.new as any;
        setChatRooms(prev => prev.map(room => 
          room.id === newMessage.room_id 
            ? { ...room, messages: [...room.messages, { ...newMessage, id: 'db-' + newMessage.id, senderNickname: newMessage.sender_nickname, timestamp: new Date(newMessage.timestamp).getTime(), type: newMessage.type || 'text' }] }
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
      await supabase.from('messages').insert([{ 
        room_id: roomId, 
        sender_nickname: userNickname, 
        text: message.text,
        type: message.type || 'text',
        poll: message.poll ? JSON.stringify(message.poll) : null
      }]);
    }
  };

  const handleCreateSquad = async (name: string): Promise<string> => {
    const id = 'sq-' + Date.now();
    const joinCode = Math.floor(1000 + Math.random() * 9000).toString();
    
    const newRoomData = {
      id,
      name,
      description: `Tactical Squad - Code: ${joinCode}`,
      is_global: false,
      join_code: joinCode
    };

    if (!isDemoMode()) {
      const { error } = await supabase.from('rooms').insert([newRoomData]);
      if (error) {
        console.error("Squad creation failed:", error);
        alert("Satellite link blocked squad creation.");
        return 'global';
      }
    }

    const newRoomObj: ChatRoom = {
      id,
      name,
      description: `Tactical Squad - Code: ${joinCode}`,
      isGlobal: false,
      messages: [{ id: 'sys-' + Date.now(), senderNickname: 'SYSTEM', text: `Squad established. Code: ${joinCode}`, timestamp: Date.now(), type: 'text', isSystem: true }],
      joinCode
    };

    setChatRooms(prev => [...prev, newRoomObj]);
    return id;
  };

  const handleJoinSquad = async (code: string): Promise<string | null> => {
    if (isDemoMode()) {
       const room = chatRooms.find(r => r.joinCode === code);
       return room ? room.id : null;
    }

    const { data, error } = await supabase.from('rooms').select('*').eq('join_code', code).single();
    if (!error && data) {
       // Check if we already have it in state
       if (!chatRooms.find(r => r.id === data.id)) {
          // Fetch existing messages for this room
          const { data: msgs } = await supabase.from('messages').select('*').eq('room_id', data.id).order('timestamp', { ascending: true });
          const newRoom: ChatRoom = {
            id: data.id,
            name: data.name,
            description: data.description,
            isGlobal: data.is_global,
            joinCode: data.join_code,
            messages: (msgs || []).map((m: any) => ({ ...m, id: 'db-' + m.id, senderNickname: m.sender_nickname, timestamp: new Date(m.timestamp).getTime() }))
          };
          setChatRooms(prev => [...prev, newRoom]);
       }
       return data.id;
    }
    return null;
  };

  const handleHubSelect = (hub: Hub) => { if (!hub.isSoldOut) { setSelectedHub(hub); setView('hub-detail'); } };
  const handleBack = () => setView(authType === 'owner' ? 'owner' : 'user');
  const handleLogout = () => { setView('landing'); setUserNickname('Player One'); };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      {view === 'landing' && <LandingView onStartAuth={(role) => { setAuthType(role); setView('auth'); }} onBrowseGuest={() => setView('user')} />}
      {view === 'auth' && <AuthView type={authType} onBack={() => setView('landing')} onSuccess={handleAuthSuccess} />}
      {view === 'user' && (
        <UserDashboard hubs={hubs} nickname={userNickname} bookings={bookings} chatRooms={chatRooms} onLogout={handleLogout} onHubSelect={handleHubSelect} onNavigateHome={() => setView('user')} onSendMessage={handleSendMessage} onVotePoll={() => {}} onCreateSquad={handleCreateSquad} onJoinSquad={handleJoinSquad} />
      )}
      {view === 'hub-detail' && selectedHub && (
        <HubDetailView hub={hubs.find(h => h.id === selectedHub.id) || selectedHub} onBack={handleBack} role={authType} onLogout={handleLogout} onBook={async (d) => { if (!isDemoMode()) await supabase.from('bookings').insert([{ hub_id: d.hubId, hub_name: d.hubName, slot_time: d.slotTime, user_name: userNickname, status: 'pending', payment_method: d.paymentMethod }]); setView('user'); }} onPostReview={() => {}} />
      )}
      {view === 'owner' && <OwnerDashboard hubs={hubs} bookings={bookings} onUpdateBookingStatus={() => {}} onLogout={handleLogout} onAddHub={() => setView('hub-register')} onEditHub={(h) => { setEditingHub(h); setView('hub-register'); }} onToggleSoldOut={() => {}} onNavigateHome={() => setView('owner')} />}
      {view === 'hub-register' && <HubRegisterView onBack={handleBack} onLogout={handleLogout} onNavigateHome={() => setView('owner')} hubToEdit={editingHub || undefined} onSave={() => setView('owner')} />}
    </div>
  );
};

export default App;