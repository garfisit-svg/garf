
import React, { useState } from 'react';
import { UserRole, Hub, Booking } from './types';
import { MOCK_HUBS, MOCK_BOOKINGS } from './constants';
import LandingView from './views/LandingView';
import AuthView from './views/AuthView';
import UserDashboard from './views/UserDashboard';
import HubDetailView from './views/HubDetailView';
import OwnerDashboard from './views/OwnerDashboard';
import HubRegisterView from './views/HubRegisterView';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'auth' | 'user' | 'owner' | 'hub-detail' | 'hub-register'>('landing');
  const [authType, setAuthType] = useState<UserRole>('user');
  const [selectedHub, setSelectedHub] = useState<Hub | null>(null);
  const [editingHub, setEditingHub] = useState<Hub | null>(null);
  
  // Dynamic Hub state
  const [hubs, setHubs] = useState<Hub[]>(MOCK_HUBS);
  // Dynamic Bookings state
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);

  const handleStartAuth = (role: UserRole) => {
    setAuthType(role);
    setView('auth');
  };

  const handleAuthSuccess = () => {
    setView(authType === 'owner' ? 'owner' : 'user');
  };

  const handleHubSelect = (hub: Hub) => {
    if (hub.isSoldOut) return;
    setSelectedHub(hub);
    setView('hub-detail');
  };

  const handleBack = () => {
    if (view === 'hub-detail' || view === 'hub-register') {
      setView(authType === 'owner' ? 'owner' : 'user');
      setEditingHub(null);
    } else if (view === 'auth') {
      setView('landing');
    } else {
      setView('landing');
    }
  };

  const handleLogout = () => {
    setView('landing');
    setEditingHub(null);
  };

  const handleAddHub = () => {
    setEditingHub(null);
    setView('hub-register');
  };

  const handleEditHub = (hub: Hub) => {
    setEditingHub(hub);
    setView('hub-register');
  };

  const handleSaveHub = (newHub: Hub) => {
    setHubs(prev => {
      const exists = prev.find(h => h.id === newHub.id);
      if (exists) {
        return prev.map(h => h.id === newHub.id ? newHub : h);
      }
      return [newHub, ...prev];
    });
    setView('owner');
    setEditingHub(null);
  };

  const handleToggleSoldOut = (hubId: string) => {
    setHubs(prev => prev.map(h => h.id === hubId ? { ...h, isSoldOut: !h.isSoldOut } : h));
  };

  const handleCreateBooking = (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status' | 'userId' | 'userName'>) => {
    const newBooking: Booking = {
      ...bookingData,
      id: 'b-' + Date.now(),
      createdAt: Date.now(),
      status: bookingData.paymentMethod === 'cash' ? 'pending' : 'confirmed',
      userId: 'u-current',
      userName: 'Current User', // Mock name
    };
    setBookings(prev => [newBooking, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      {view === 'landing' && <LandingView onStartAuth={handleStartAuth} onBrowseGuest={() => setView('user')} />}
      {view === 'auth' && <AuthView type={authType} onBack={handleBack} onSuccess={handleAuthSuccess} />}
      {view === 'user' && (
        <UserDashboard 
          hubs={hubs}
          bookings={bookings.filter(b => b.userId === 'u-current')}
          onLogout={handleLogout} 
          onHubSelect={handleHubSelect} 
          onNavigateHome={() => setView('user')}
        />
      )}
      {view === 'hub-detail' && selectedHub && (
        <HubDetailView 
          hub={selectedHub} 
          onBack={handleBack} 
          role={authType} 
          onLogout={handleLogout}
          onBook={handleCreateBooking}
        />
      )}
      {view === 'owner' && (
        <OwnerDashboard 
          hubs={hubs}
          onLogout={handleLogout} 
          onAddHub={handleAddHub}
          onEditHub={handleEditHub}
          onToggleSoldOut={handleToggleSoldOut}
          onNavigateHome={() => setView('owner')}
        />
      )}
      {view === 'hub-register' && (
        <HubRegisterView 
          onBack={handleBack} 
          onLogout={handleLogout} 
          onNavigateHome={() => setView('owner')} 
          hubToEdit={editingHub || undefined}
          onSave={handleSaveHub}
        />
      )}
    </div>
  );
};

export default App;
