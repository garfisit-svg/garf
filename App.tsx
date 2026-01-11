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
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([
    { id: 'global', name: 'Global Arena Chat', description: 'Main communication hub for all players.', isGlobal: true, messages: [] }
  ]);

  const viewRef = useRef(view);
  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  useEffect(() => {
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user ?? null;
      setSessionUser(user);
      
      if (user) {
        const role = user.user_metadata?.role as UserRole;
        const nickname = user.user_metadata?.nickname;
        setAuthType(role);
        setUserNickname(nickname || (role === 'owner' ? 'Owner' : 'Player'));
        
        if (viewRef.current === 'landing' || viewRef.current === 'auth') {
          setView(role === 'owner' ? 'owner' : 'user');
        }
      } else {
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
      if (isDemoMode() || view === 'landing' || view === 'auth') {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
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
            contactEmail: h.contact_email,
            slots: h.slots || [],
          })));
        }

        let bookingsQuery = supabase.from('bookings').select('*');
        if (authType === 'owner' && hubsData && hubsData.length > 0) {
          const ownerHubIds = hubsData.map(h => h.id);
          bookingsQuery = bookingsQuery.in('hub_id', ownerHubIds);
        } else if (authType === 'user') {
          bookingsQuery = bookingsQuery.eq('user_name', userNickname);
        } else if (authType === 'owner') {
           setBookings([]);
           bookingsQuery = null as any;
        }

        if (bookingsQuery) {
          const { data: bookingsData, error: bookingsError } = await bookingsQuery;
          if (bookingsError) throw bookingsError;
          if (bookingsData) setBookings(bookingsData.map((b: any) => ({
            ...b,
            paymentMethod: b.payment_method || 'cash',
            slotTime: b.slot_time,
            hubName: b.hub_name,
            createdAt: new Date(b.created_at).getTime()
          })));
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
          
          const baseGlobal = { id: 'global', name: 'Global Arena Chat', description: 'Main communication hub for all players.', isGlobal: true, messages: [] };
          const hasGlobal = formattedRooms.some(r => r.isGlobal);
          setChatRooms(hasGlobal ? formattedRooms : [baseGlobal, ...formattedRooms]);
        }

      } catch (err: any) {
        console.error("Link Failure Diagnostics:", err);
        const errMsg = err.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
        setError(errMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [view, sessionUser, authType, userNickname, refreshTrigger]);

  const handleBook = async (d: any) => {
    try {
      const { error: bookError } = await supabase.from('bookings').insert([{ 
        hub_id: d.hubId, 
        hub_name: d.hubName, 
        slot_time: d.slotTime, 
        user_name: userNickname, 
        status: d.paymentMethod === 'cash' ? 'pending' : 'confirmed', 
        payment_method: d.paymentMethod,
        transaction_id: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      }]);
      
      if (bookError) throw bookError;
      setRefreshTrigger(p => p + 1);
      setView('user');
    } catch (err: any) {
      alert("Satellite Link Failure: " + err.message);
    }
  };

  const handleSendMessage = async (roomId: string, message: Partial<ChatMessage>) => {
    if (!sessionUser) return;
    const { error: sendError } = await supabase.from('messages').insert([{ 
      room_id: roomId === 'global' ? '00000000-0000-0000-0000-000000000000' : roomId, 
      sender_nickname: userNickname, 
      text: message.text,
      type: message.type || 'text',
      poll: message.poll || null
    }]);
    if (!sendError) setRefreshTrigger(prev => prev + 1);
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

    const { error: voteError } = await supabase.from('messages')
      .update({ poll: newPoll })
      .eq('id', parseInt(messageId));
      
    if (!voteError) setRefreshTrigger(prev => prev + 1);
  };

  const handleCreateSquad = async (name: string): Promise<string> => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const { data, error: createError } = await supabase.from('rooms').insert([{
      name,
      description: `Private frequency by ${userNickname}`,
      is_global: false,
      join_code: code
    }]).select();

    if (createError) throw createError;
    setRefreshTrigger(prev => prev + 1);
    return data[0].id;
  };

  const handleJoinSquad = async (code: string): Promise<string | null> => {
    const { data, error: joinError } = await supabase.from('rooms').select('id').eq('join_code', code);
    if (joinError || !data.length) return null;
    setRefreshTrigger(prev => prev + 1);
    return data[0].id;
  };

  // Fix: Added handleAuthSuccess to resolve the error in AuthView onSuccess prop
  const handleAuthSuccess = (nickname?: string) => {
    if (nickname) setUserNickname(nickname);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('landing');
    setAuthType('user');
    setSessionUser(null);
    setHubs([]);
    setBookings([]);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-8 animate-pulse">
          <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Satellite Link Lost</h1>
        <p className="text-slate-500 max-w-xl mb-8 font-medium leading-relaxed">
          The database reported a discrepancy: <span className="text-red-400 font-bold">{error}</span>. 
          <br/><br/>
          <span className="text-emerald-400 font-black uppercase text-xs">Correction:</span><br/>
          Ensure the <span className="text-white">SQL Schema</span> provided has been deployed in your Supabase Editor.
        </p>
        <button onClick={() => setRefreshTrigger(p => p + 1)} className="px-8 py-4 bg-white text-black font-black rounded-2xl uppercase tracking-widest hover:scale-105 transition-all">Retry Synchronization</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans">
      {view === 'landing' && <LandingView onStartAuth={(role) => { setAuthType(role); setView('auth'); }} onBrowseGuest={() => { setAuthType('guest'); setView('user'); }} />}
      {view === 'auth' && <AuthView type={authType} onBack={() => setView('landing')} onSuccess={handleAuthSuccess} />}
      {view === 'user' && (
        <UserDashboard hubs={hubs} nickname={userNickname} bookings={bookings} chatRooms={chatRooms} onLogout={handleLogout} onHubSelect={(h) => { setSelectedHub(h); setView('hub-detail'); }} onNavigateHome={() => setView('user')} onSendMessage={handleSendMessage} onVotePoll={handleVotePoll} onCreateSquad={handleCreateSquad} onJoinSquad={handleJoinSquad} />
      )}
      {view === 'hub-detail' && selectedHub && (
        <HubDetailView hub={hubs.find(h => h.id === selectedHub.id) || selectedHub} onBack={() => setView('user')} role={authType} onLogout={handleLogout} onBook={handleBook} onPostReview={() => {}} />
      )}
      {view === 'owner' && <OwnerDashboard hubs={hubs} bookings={bookings} onUpdateBookingStatus={async (id, status) => { await supabase.from('bookings').update({ status }).eq('id', id); setRefreshTrigger(p => p + 1); }} onLogout={handleLogout} onAddHub={() => { setEditingHub(null); setView('hub-register'); }} onEditHub={(h) => { setEditingHub(h); setView('hub-register'); }} onDeleteHub={async (id) => { await supabase.from('hubs').delete().eq('id', id); setRefreshTrigger(p => p + 1); }} onToggleSoldOut={async (id) => { const h = hubs.find(h => h.id === id); if(h) await supabase.from('hubs').update({ is_sold_out: !h.isSoldOut }).eq('id', id); setRefreshTrigger(p => p + 1); }} onNavigateHome={() => setView('owner')} />}
      {view === 'hub-register' && <HubRegisterView onBack={() => setView('owner')} onLogout={handleLogout} onNavigateHome={() => setView('owner')} hubToEdit={editingHub || undefined} onSave={async (hubData) => { 
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
        if (editingHub) {
          await supabase.from('hubs').update(payload).eq('id', editingHub.id);
        } else {
          await supabase.from('hubs').insert([payload]);
        }
        setRefreshTrigger(p => p + 1);
        setView('owner');
      }} />}
    </div>
  );
};

export default App;