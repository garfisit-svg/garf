
import React, { useState } from 'react';
import { UserRole, Hub, Booking, Review } from './types';
import LandingView from './views/LandingView';
import AuthView from './views/AuthView';
import UserDashboard from './views/UserDashboard';
import HubDetailView from './views/HubDetailView';
import OwnerDashboard from './views/OwnerDashboard';
import HubRegisterView from './views/HubRegisterView';
import { MOCK_HUBS } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'auth' | 'user' | 'owner' | 'hub-detail' | 'hub-register'>('landing');
  const [authType, setAuthType] = useState<UserRole>('user');
  const [selectedHub, setSelectedHub] = useState<Hub | null>(null);
  const [editingHub, setEditingHub] = useState<Hub | null>(null);
  const [userNickname, setUserNickname] = useState<string>('Player One');
  
  // Initialize with dummy data for user browsing
  const [hubs, setHubs] = useState<Hub[]>(MOCK_HUBS);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // We track user-created IDs to differentiate from MOCK_HUBS in the owner panel
  const [ownerHubIds, setOwnerHubIds] = useState<Set<string>>(new Set());

  const handleStartAuth = (role: UserRole) => {
    setAuthType(role);
    setView('auth');
  };

  const handleAuthSuccess = (nickname?: string) => {
    if (nickname) {
      setUserNickname(nickname);
    } else if (authType === 'owner') {
      setUserNickname('System Owner'); // Fixed identifier for owners
    }
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
    setUserNickname('Player One');
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
    setOwnerHubIds(prev => new Set(prev).add(newHub.id));
    setView('owner');
    setEditingHub(null);
  };

  const handlePostReview = (hubId: string, review: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...review,
      id: 'rev-' + Date.now(),
      date: new Date().toISOString().split('T')[0]
    };

    setHubs(prev => prev.map(hub => {
      if (hub.id === hubId) {
        const updatedReviews = [newReview, ...(hub.reviews || [])];
        const avgRating = updatedReviews.reduce((acc, curr) => acc + curr.rating, 0) / updatedReviews.length;
        return { ...hub, reviews: updatedReviews, rating: parseFloat(avgRating.toFixed(1)) };
      }
      return hub;
    }));
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
      userName: userNickname,
    };

    setBookings(prev => [newBooking, ...prev]);

    // Lock the slot in the hub data
    setHubs(prevHubs => prevHubs.map(hub => {
      if (hub.id === bookingData.hubId) {
        if (hub.type === 'TURF') {
          return {
            ...hub,
            slots: hub.slots.map(s => s.id === bookingData.slotId ? { ...s, available: false } : s)
          };
        } else {
          return {
            ...hub,
            accessories: hub.accessories?.map(acc => {
              if (acc.name === bookingData.accessoryName) {
                return {
                  ...acc,
                  slots: acc.slots.map(s => s.id === bookingData.slotId ? { ...s, available: false } : s)
                };
              }
              return acc;
            })
          };
        }
      }
      return hub;
    }));
  };

  const handleUpdateBookingStatus = (id: string, status: 'confirmed' | 'expired') => {
    const bookingToUpdate = bookings.find(b => b.id === id);
    
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));

    // If a booking is released/expired, make the slot available again
    if (status === 'expired' && bookingToUpdate) {
      setHubs(prevHubs => prevHubs.map(hub => {
        if (hub.id === bookingToUpdate.hubId) {
          if (hub.type === 'TURF') {
            return {
              ...hub,
              slots: hub.slots.map(s => s.id === bookingToUpdate.slotId ? { ...s, available: true } : s)
            };
          } else {
            return {
              ...hub,
              accessories: hub.accessories?.map(acc => {
                if (acc.name === bookingToUpdate.accessoryName) {
                  return {
                    ...acc,
                    slots: acc.slots.map(s => s.id === bookingToUpdate.slotId ? { ...s, available: true } : s)
                  };
                }
                return acc;
              })
            };
          }
        }
        return hub;
      }));
    }
  };

  // Filter for Owner: only hubs they created and arrivals for those hubs
  const ownerHubs = hubs.filter(h => ownerHubIds.has(h.id));
  const ownerArrivals = bookings.filter(b => ownerHubIds.has(b.hubId));

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      {view === 'landing' && <LandingView onStartAuth={handleStartAuth} onBrowseGuest={() => setView('user')} />}
      {view === 'auth' && <AuthView type={authType} onBack={handleBack} onSuccess={handleAuthSuccess} />}
      {view === 'user' && (
        <UserDashboard 
          hubs={hubs}
          nickname={userNickname}
          bookings={bookings.filter(b => b.userId === 'u-current')}
          onLogout={handleLogout} 
          onHubSelect={handleHubSelect} 
          onNavigateHome={() => setView('user')}
        />
      )}
      {view === 'hub-detail' && selectedHub && (
        <HubDetailView 
          hub={hubs.find(h => h.id === selectedHub.id) || selectedHub} 
          onBack={handleBack} 
          role={authType} 
          onLogout={handleLogout}
          onBook={handleCreateBooking}
          onPostReview={handlePostReview}
        />
      )}
      {view === 'owner' && (
        <OwnerDashboard 
          hubs={ownerHubs}
          bookings={ownerArrivals}
          onUpdateBookingStatus={handleUpdateBookingStatus}
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
