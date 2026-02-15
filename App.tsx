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
  const [isDeleting, setIsDeleting] = useState(false);
  
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
        if (role) {
          setAuthType(role);
          setUserNickname(session.user.user_metadata?.nickname || 'User');
          setView(role === 'owner' ? 'owner' : 'user');
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user ?? null;
      setSessionUser(user);
      if (user) {
        const role = user.user_metadata?.role as UserRole;
        setAuthType(role);
        setUserNickname(user.user_metadata?.nickname || 'User');
        if (viewRef.current === 'landing' || viewRef.current === 'auth') {
          setView(role === 'owner' ? 'owner' : 'user');
        }
      } else {
        if (viewRef.current !== 'landing' && viewRef.current !== 'auth') {
          setView('landing');
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
      try {
        const { data: hubsData, error: hubsError } = await supabase.from('hubs').select('*');
        if (hubsError) throw hubsError;
        
        if (hubsData) {
          setHubs(hubsData.map((h: any) => ({
            ...h,
            id: h.id.toString(),
            owner_id: h.owner_id,
            priceStart: Number(h.price_start) || 0,
            isSoldOut: !!h.is_sold_out,
            contactPhone: h.contact_phone || '',
            contactEmail: h.contact_email || '',
            upiId: h.upi_id || '',
            foodMenu: Array.isArray(h.food_menu) ? h.food_menu : [],
            slots: Array.isArray(h.slots) ? h.slots : [],
            categories: Array.isArray(h.categories) ? h.categories : [],
          })));
        }

        const { data: bookingsData, error: bookingsError } = await supabase.from('bookings').select('*');
        if (bookingsError) throw bookingsError;
        if (bookingsData) {
           setBookings(bookingsData.map((b: any) => ({
              ...b,
              id: b.id.toString(),
              hubId: b.hub_id?.toString(),
              paymentMethod: b.payment_method || 'upi',
              slotTime: b.slot_time,
              hubName: b.hub_name,
              totalPrice: Number(b.total_price) || 0,
              status: b.status,
              playerCount: Number(b.player_count) || 1,
              categoryId: b.category_id,
              categoryName: b.category_name
           })));
        }
      } catch (err: any) {
        console.error("Sync Error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [view, refreshTrigger, sessionUser]);

  const handleSendMessage = (roomId: string, message: Partial<ChatMessage>) => {
    if (!sessionUser) return;
    const newMessage: ChatMessage = {
      id: 'msg-' + Math.random().toString(36).substr(2, 9),
      senderId: sessionUser.id,
      senderNickname: userNickname,
      timestamp: Date.now(),
      type: message.type || 'text',
      text: message.text,
      poll: message.poll,
      isSystem: message.isSystem || message.type === 'system'
    };

    setChatRooms(prev => prev.map(room => {
      if (room.id !== roomId) return room;
      return { ...room, messages: [...room.messages, newMessage] };
    }));
  };

  const handleDeleteMessage = (roomId: string, messageId: string) => {
    setChatRooms(prev => prev.map(room => {
      if (room.id !== roomId) return room;
      return { ...room, messages: room.messages.filter(m => m.id !== messageId) };
    }));
  };

  const handleCreateSquad = (name: string): Promise<string> => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const newRoomId = 'squad-' + Date.now();
    const newRoom: ChatRoom = {
      id: newRoomId,
      name: name,
      description: `Tactical squad frequency. Join Code: ${code}`,
      isGlobal: false,
      joinCode: code,
      messages: [{
        id: 'sys-' + Date.now(),
        senderId: 'system',
        senderNickname: 'GARF SYSTEM',
        text: `Frequency established. Share code [ ${code} ] to invite your squad members. Welcome, ${userNickname}.`,
        timestamp: Date.now(),
        type: 'system',
        isSystem: true
      }]
    };
    setChatRooms(prev => [...prev, newRoom]);
    return Promise.resolve(newRoomId);
  };

  const handleJoinSquad = (code: string): Promise<string | null> => {
    const room = chatRooms.find(r => r.joinCode === code);
    if (room) {
      handleSendMessage(room.id, { 
        type: 'system', 
        text: `Member ${userNickname} has established a tactical link to this frequency.`,
        isSystem: true 
      });
      return Promise.resolve(room.id);
    }
    return Promise.resolve(null);
  };

  const handleVotePoll = (roomId: string, messageId: string, optionIndex: number) => {
    if (!sessionUser) return;
    setChatRooms(prev => prev.map(room => {
      if (room.id !== roomId) return room;
      return {
        ...room,
        messages: room.messages.map(msg => {
          if (msg.id !== messageId || !msg.poll) return msg;
          const updatedOptions = msg.poll.options.map((opt, i) => {
            if (i !== optionIndex) {
              return { ...opt, votes: opt.votes.filter(v => v !== sessionUser.id) };
            }
            return {
              ...opt,
              votes: opt.votes.includes(sessionUser.id) ? opt.votes : [...opt.votes, sessionUser.id]
            };
          });
          return { ...msg, poll: { ...msg.poll, options: updatedOptions } };
        })
      };
    }));
  };

  const handleSaveHub = async (hubData: Hub) => {
    if (!sessionUser) return;
    const payload: any = {
      name: hubData.name,
      type: hubData.type,
      location: hubData.location,
      price_start: Number(hubData.priceStart),
      description: hubData.description || "",
      images: hubData.images,
      food_menu: hubData.foodMenu || [],
      contact_phone: hubData.contactPhone || "",
      contact_email: hubData.contactEmail || "",
      upi_id: hubData.upiId || "",
      is_sold_out: !!hubData.isSoldOut,
      slots: hubData.slots || [],
      categories: hubData.categories || [],
      owner_id: sessionUser.id
    };
    try {
      let result;
      if (editingHub) {
        result = await supabase.from('hubs').update(payload).eq('id', editingHub.id);
      } else {
        result = await supabase.from('hubs').insert([payload]).select();
      }
      if (result.error) throw result.error;
      setRefreshTrigger(p => p + 1);
      setView('owner');
    } catch (err: any) {
      console.error("Deployment Failure:", err);
      if (err.code === 'PGRST204') {
        setError(`DATABASE ERROR: Column "categories" missing. Please run the SQL: ALTER TABLE hubs ADD COLUMN categories jsonb DEFAULT '[]'::jsonb;`);
      } else {
        setError(`Deployment failed: ${err.message}`);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('landing');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans">
      {error && (
        <div className="fixed bottom-10 right-10 z-[1000] bg-red-600 text-white p-6 rounded-2xl shadow-2xl max-w-md border border-red-400">
          <h4 className="font-black uppercase text-xs mb-2">Protocol Error</h4>
          <p className="text-xs font-bold leading-relaxed">{error}</p>
          <button onClick={() => setError(null)} className="mt-4 bg-white/20 hover:bg-white/40 px-4 py-2 rounded-xl text-[10px] font-black uppercase">Dismiss</button>
        </div>
      )}

      {view === 'landing' && <LandingView onStartAuth={(role) => { setAuthType(role); setView('auth'); }} onBrowseGuest={() => { setAuthType('guest'); setView('user'); }} />}
      {view === 'auth' && <AuthView type={authType} onBack={() => setView('landing')} onSuccess={(nk) => { if(nk) setUserNickname(nk); }} />}
      {view === 'user' && (
        <UserDashboard 
          hubs={hubs} 
          nickname={userNickname} 
          currentUserId={sessionUser?.id}
          bookings={bookings} 
          chatRooms={chatRooms} 
          onLogout={handleLogout} 
          onHubSelect={(h) => { setSelectedHub(h); setView('hub-detail'); }} 
          onNavigateHome={() => setView('user')} 
          onSendMessage={handleSendMessage}
          onDeleteMessage={handleDeleteMessage}
          onVotePoll={handleVotePoll} 
          onCreateSquad={handleCreateSquad} 
          onJoinSquad={handleJoinSquad} 
        />
      )}
      {view === 'hub-detail' && selectedHub && (
        <HubDetailView hub={hubs.find(h => h.id === selectedHub.id) || selectedHub} onBack={() => setView('user')} role={authType} onLogout={handleLogout} onBook={(d) => {}} allBookings={bookings} />
      )}
      {view === 'owner' && <OwnerDashboard hubs={hubs} sessionUser={sessionUser} bookings={bookings} onUpdateBookingStatus={(id, s) => {}} onLogout={handleLogout} onAddHub={() => { setEditingHub(null); setView('hub-register'); }} onEditHub={(h) => { setEditingHub(h); setView('hub-register'); }} onDeleteHub={() => {}} onToggleSoldOut={() => {}} onNavigateHome={() => setView('owner')} />}
      {view === 'hub-register' && <HubRegisterView onBack={() => setView('owner')} onLogout={handleLogout} onNavigateHome={() => setView('owner')} hubToEdit={editingHub || undefined} onSave={handleSaveHub} />}
    </div>
  );
};

export default App;