import React, { useState, useEffect, useRef } from 'react';
import { UserRole, Hub, Booking, ChatRoom, ChatMessage, Poll } from './types';
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
  const [sessionUser, setSessionUser] = useState<any>(null);
  
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([
    { id: 'global', name: 'Global Arena Chat', description: 'Main communication hub for all players.', isGlobal: true, messages: [] }
  ]);

  // Ref to track the current view safely inside the auth listener closure
  const viewRef = useRef(view);
  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSessionUser(session.user);
        const role = session.user.user_metadata?.role as UserRole;
        const nickname = session.user.user_metadata?.nickname;
        if (role) {
          setAuthType(role);
          setUserNickname(nickname || (role === 'owner' ? 'Owner' : 'Player'));
          setView(role === 'owner' ? 'owner' : 'user');
        }
      }
    });

    // Unified Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user ?? null;
      setSessionUser(user);
      
      if (user) {
        const role = user.user_metadata?.role as UserRole;
        const nickname = user.user_metadata?.nickname;
        setAuthType(role);
        setUserNickname(nickname || (role === 'owner' ? 'Owner' : 'Player'));
        
        // Force navigate to dashboard only if we are currently on Landing or Auth views
        if (viewRef.current === 'landing' || viewRef.current === 'auth') {
          setView(role === 'owner' ? 'owner' : 'user');
        }
      } else {
        // Handle Logout or Session Expiry: kick to landing if in a protected view
        if (viewRef.current !== 'landing' && viewRef.current !== 'auth') {
          setView('landing');
          setHubs([]);
          setBookings([]);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      // Don't fetch if we're on non-data views
      if (isDemoMode() || view === 'landing' || view === 'auth') {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        let hubsQuery = supabase.from('hubs').select('*');
        if (authType === 'owner' && sessionUser) {
          hubsQuery = hubsQuery.eq('owner_id', sessionUser.id);
        }

        const { data: hubsData, error: hubsError } = await hubsQuery;
        if (hubsError) throw hubsError;
        
        if (hubsData) {
          setHubs(hubsData.map((h: any) => ({
            ...h,
            priceStart: h.price_start,
            isSoldOut: h.is_sold_out,
            contactPhone: h.contact_phone,
            contact_email: h.contact_email,
            slots: h.slots || [],
          })));
        }

        let bookingsQuery = supabase.from('bookings').select('*');
        if (authType === 'owner' && hubsData) {
          const ownerHubIds = hubsData.map(h => h.id);
          if (ownerHubIds.length > 0) {
            bookingsQuery = bookingsQuery.in('hub_id', ownerHubIds);
          } else {
            setBookings([]);
            bookingsQuery = null as any;
          }
        } else if (authType === 'user') {
          bookingsQuery = bookingsQuery.eq('user_name', userNickname);
        }

        if (bookingsQuery) {
          const { data: bookingsData, error: bookingsError } = await bookingsQuery;
          if (bookingsError) throw bookingsError;
          if (bookingsData) setBookings(bookingsData as any);
        }

        const { data: roomsData } = await supabase.from('rooms').select('*');
        if (roomsData) {
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
                  id: m.id.toString(),
                  senderNickname: m.sender_nickname,
                  timestamp: new Date(m.timestamp).getTime(),
                  poll: m.poll ? (typeof m.poll === 'string' ? JSON.parse(m.poll) : m.poll) : undefined
                }))
             };
          }));
          
          const hasGlobal = formattedRooms.some(r => r.id === 'global' || r.isGlobal);
          const baseGlobal = chatRooms.find(r => r.id === 'global')!;
          setChatRooms(hasGlobal ? formattedRooms : [baseGlobal, ...formattedRooms]);
        }

      } catch (err: any) {
        console.error("Link Failure:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [view, sessionUser, authType, userNickname, refreshTrigger]);

  const handleAuthSuccess = (nickname?: string) => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setSessionUser(user);
      const role = user?.user_metadata?.role as UserRole;
      if (nickname) setUserNickname(nickname);
      setAuthType(role);
      setView(role === 'owner' ? 'owner' : 'user');
    });
  };

  const handleCreateSquad = async (name: string) => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const { data, error } = await supabase.from('rooms').insert([{
      name,
      description: `Private frequency created by ${userNickname}`,
      is_global: false,
      join_code: code
    }]).select();

    if (error) throw error;
    setRefreshTrigger(prev => prev + 1);
    return data[0].id;
  };

  const handleJoinSquad = async (code: string) => {
    const { data, error } = await supabase.from('rooms').select('id').eq('join_code', code);
    if (error || !data.length) return null;
    setRefreshTrigger(prev => prev + 1);
    return data[0].id;
  };

  const handleVotePoll = async (roomId: string, messageId: string, optionIndex: number) => {
    const room = chatRooms.find(r => r.id === roomId);
    const message = room?.messages.find(m => m.id === messageId);
    if (!message || !message.poll) return;

    const newPoll: Poll = JSON.parse(JSON.stringify(message.poll));
    newPoll.options.forEach((opt, idx) => {
      opt.votes = opt.votes.filter(v => v !== userNickname);
      if (idx === optionIndex) opt.votes.push(userNickname);
    });

    const { error } = await supabase.from('messages')
      .update({ poll: newPoll })
      .eq('id', parseInt(messageId));
      
    if (!error) setRefreshTrigger(prev => prev + 1);
  };

  const handleSendMessage = async (roomId: string, message: Partial<ChatMessage>) => {
    if (!sessionUser) return;
    const { error } = await supabase.from('messages').insert([{ 
      room_id: roomId, 
      sender_nickname: userNickname, 
      text: message.text,
      type: message.type || 'text',
      poll: message.poll || null
    }]);
    if (!error) setRefreshTrigger(prev => prev + 1);
  };

  const handleSaveHub = async (hubData: Hub) => {
    if (!sessionUser) return;
    const payload = {
      name: hubData.name,
      type: hubData.type,
      location: hubData.location,
      price_start: hubData.priceStart,
      description: hubData.description,
      images: hubData.images,
      contact_phone: hubData.contactPhone,
      contact_email: hubData.contactEmail,
      is_sold_out: hubData.isSoldOut,
      slots: hubData.slots,
      owner_id: sessionUser.id
    };
    try {
      if (editingHub) {
        await supabase.from('hubs').update(payload).eq('id', editingHub.id);
      } else {
        await supabase.from('hubs').insert([payload]);
      }
      setRefreshTrigger(prev => prev + 1);
      setView('owner');
    } catch (err) {
      alert("Encryption error.");
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign-out failure:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans">
      {view === 'landing' && (
        <LandingView 
          onStartAuth={(role) => { 
            setAuthType(role); 
            setView('auth'); 
          }} 
          onBrowseGuest={() => { 
            setAuthType('guest'); 
            setView('user'); 
          }} 
        />
      )}
      {view === 'auth' && (
        <AuthView 
          type={authType} 
          onBack={() => setView('landing')} 
          onSuccess={handleAuthSuccess} 
        />
      )}
      {view === 'user' && (
        <UserDashboard hubs={hubs} nickname={userNickname} bookings={bookings} chatRooms={chatRooms} onLogout={handleLogout} onHubSelect={(h) => { setSelectedHub(h); setView('hub-detail'); }} onNavigateHome={() => setView('user')} onSendMessage={handleSendMessage} onVotePoll={handleVotePoll} onCreateSquad={handleCreateSquad} onJoinSquad={handleJoinSquad} />
      )}
      {view === 'hub-detail' && selectedHub && (
        <HubDetailView hub={hubs.find(h => h.id === selectedHub.id) || selectedHub} onBack={() => setView('user')} role={authType} onLogout={handleLogout} onBook={async (d) => { await supabase.from('bookings').insert([{ hub_id: d.hubId, hub_name: d.hubName, slot_time: d.slotTime, user_name: userNickname, status: 'pending', payment_method: d.paymentMethod }]); setRefreshTrigger(p => p + 1); setView('user'); }} onPostReview={() => {}} />
      )}
      {view === 'owner' && <OwnerDashboard hubs={hubs} bookings={bookings} onUpdateBookingStatus={() => {}} onLogout={handleLogout} onAddHub={() => { setEditingHub(null); setView('hub-register'); }} onEditHub={(h) => { setEditingHub(h); setView('hub-register'); }} onDeleteHub={(id) => {}} onToggleSoldOut={() => {}} onNavigateHome={() => setView('owner')} />}
      {view === 'hub-register' && <HubRegisterView onBack={() => setView('owner')} onLogout={handleLogout} onNavigateHome={() => setView('owner')} hubToEdit={editingHub || undefined} onSave={handleSaveHub} />}
    </div>
  );
};

export default App;