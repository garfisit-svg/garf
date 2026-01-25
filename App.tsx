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

  // Handle Session Persistence
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

  // Centralized Data Fetcher
  useEffect(() => {
    const fetchData = async () => {
      if (isDemoMode() || view === 'landing' || view === 'auth') {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch Hubs
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
            slots: Array.isArray(h.slots) ? h.slots : [],
            accessories: Array.isArray(h.accessories) ? h.accessories : undefined
          })));
        }

        // Fetch Bookings
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
              status: b.status
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

  const handleSaveHub = async (hubData: Hub) => {
    if (!sessionUser) return;
    
    // Standardized payload matching Supabase snake_case conventions
    const payload: any = {
      name: hubData.name,
      type: hubData.type,
      location: hubData.location,
      price_start: Number(hubData.priceStart),
      description: hubData.description || "",
      images: hubData.images,
      contact_phone: hubData.contactPhone || "",
      contact_email: hubData.contactEmail || "",
      upi_id: hubData.upiId || "",
      is_sold_out: !!hubData.isSoldOut,
      slots: hubData.slots || [],
      accessories: hubData.accessories || null,
      owner_id: sessionUser.id
    };

    try {
      let result;
      if (editingHub) {
        result = await supabase.from('hubs').update(payload).eq('id', editingHub.id);
      } else {
        result = await supabase.from('hubs').insert([payload]).select();
      }
      
      if (result.error) {
        // Handle Missing Column Error (PGRST204)
        if (result.error.code === 'PGRST204') {
          const sqlFix = `ALTER TABLE hubs ADD COLUMN IF NOT EXISTS upi_id TEXT; ALTER TABLE hubs ADD COLUMN IF NOT EXISTS contact_phone TEXT; ALTER TABLE hubs ADD COLUMN IF NOT EXISTS contact_email TEXT; ALTER TABLE hubs ADD COLUMN IF NOT EXISTS slots JSONB DEFAULT '[]'; ALTER TABLE hubs ADD COLUMN IF NOT EXISTS accessories JSONB; ALTER TABLE hubs ADD COLUMN IF NOT EXISTS is_sold_out BOOLEAN DEFAULT false;`;
          
          alert(`DATABASE SCHEMA ERROR: The column '${result.error.message.split("'")[1]}' is missing.\n\nFIX: Go to your Supabase SQL Editor and run this:\n\n${sqlFix}`);
          throw result.error;
        }
        throw result.error;
      }
      
      setRefreshTrigger(p => p + 1);
      setView('owner');
    } catch (err: any) {
      console.error("Deployment Failure:", err);
      // alert remains as backup if code above doesn't catch it
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setHubs([]);
    setBookings([]);
    setView('landing');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans">
      {view === 'landing' && <LandingView onStartAuth={(role) => { setAuthType(role); setView('auth'); }} onBrowseGuest={() => { setAuthType('guest'); setView('user'); }} />}
      {view === 'auth' && <AuthView type={authType} onBack={() => setView('landing')} onSuccess={(nk) => { if(nk) setUserNickname(nk); }} />}
      {view === 'user' && (
        <UserDashboard hubs={hubs} nickname={userNickname} bookings={bookings} chatRooms={chatRooms} onLogout={handleLogout} onHubSelect={(h) => { setSelectedHub(h); setView('hub-detail'); }} onNavigateHome={() => setView('user')} onSendMessage={() => {}} onVotePoll={() => {}} onCreateSquad={() => Promise.resolve('0')} onJoinSquad={() => Promise.resolve(null)} />
      )}
      {view === 'hub-detail' && selectedHub && (
        <HubDetailView hub={hubs.find(h => h.id === selectedHub.id) || selectedHub} onBack={() => setView('user')} role={authType} onLogout={handleLogout} onBook={() => {}} onPostReview={() => {}} allBookings={bookings} />
      )}
      {view === 'owner' && <OwnerDashboard hubs={hubs} sessionUser={sessionUser} bookings={bookings} onUpdateBookingStatus={async (id, status) => { await supabase.from('bookings').update({ status }).eq('id', id); setRefreshTrigger(p => p + 1); }} onLogout={handleLogout} onAddHub={() => { setEditingHub(null); setView('hub-register'); }} onEditHub={(h) => { setEditingHub(h); setView('hub-register'); }} onDeleteHub={async (id) => { if(confirm('Are you sure?')) { await supabase.from('hubs').delete().eq('id', id); setRefreshTrigger(p => p + 1); } }} onToggleSoldOut={async (id) => { const h = hubs.find(h => h.id === id); if(h) await supabase.from('hubs').update({ is_sold_out: !h.isSoldOut }).eq('id', id); setRefreshTrigger(p => p + 1); }} onNavigateHome={() => setView('owner')} />}
      {view === 'hub-register' && <HubRegisterView onBack={() => setView('owner')} onLogout={handleLogout} onNavigateHome={() => setView('owner')} hubToEdit={editingHub || undefined} onSave={handleSaveHub} />}
    </div>
  );
};

export default App;