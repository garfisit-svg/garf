
import React, { useState } from 'react';
import { UserRole, Hub, Booking, Review, ChatRoom, ChatMessage, Poll } from './types';
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
  
  // Chat Rooms State
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([
    {
      id: 'global',
      name: 'Global Arena Chat',
      description: 'The main hub for finding players and general discussion.',
      isGlobal: true,
      messages: [
        { id: 'm1', senderNickname: 'GarfSystem', text: 'Welcome to the Global Arena! Be respectful and play hard.', timestamp: Date.now() - 3600000, type: 'text', isSystem: true },
        { id: 'm2', senderNickname: 'ProGamer', text: 'Looking for 2 more players for Arena One Turf tonight at 8 PM. Who is in?', timestamp: Date.now() - 1800000, type: 'text' },
      ]
    },
    {
      id: 'squad-1',
      name: 'Mumbai Strikers',
      description: 'Private squad for weekend turf games.',
      isGlobal: false,
      messages: []
    }
  ]);

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
      setUserNickname('System Owner'); 
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

    // Add a system message to global chat when a booking is made
    const systemMsg: ChatMessage = {
      id: 'm-' + Date.now(),
      senderNickname: 'GarfSystem',
      text: `${userNickname} just reserved a slot at ${bookingData.hubName}! ${bookingData.playerCount ? `Room for ${bookingData.playerCount} players.` : ''}`,
      timestamp: Date.now(),
      type: 'text',
      isSystem: true
    };
    setChatRooms(prev => prev.map(room => 
      room.id === 'global' ? { ...room, messages: [...room.messages, systemMsg] } : room
    ));

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

  const handleSendMessage = (roomId: string, message: Partial<ChatMessage>) => {
    const newMsg: ChatMessage = {
      id: 'm-' + Date.now(),
      senderNickname: userNickname,
      timestamp: Date.now(),
      type: 'text',
      ...message
    } as ChatMessage;

    setChatRooms(prev => prev.map(room => 
      room.id === roomId ? { ...room, messages: [...room.messages, newMsg] } : room
    ));
  };

  const handleVotePoll = (roomId: string, messageId: string, optionIndex: number) => {
    setChatRooms(prev => prev.map(room => {
      if (room.id !== roomId) return room;
      return {
        ...room,
        messages: room.messages.map(msg => {
          if (msg.id !== messageId || !msg.poll) return msg;
          
          const newOptions = msg.poll.options.map((opt, idx) => {
            // Remove nickname from all options first to prevent double voting
            const filteredVotes = opt.votes.filter(n => n !== userNickname);
            if (idx === optionIndex) {
              return { ...opt, votes: [...filteredVotes, userNickname] };
            }
            return { ...opt, votes: filteredVotes };
          });
          
          return { ...msg, poll: { ...msg.poll, options: newOptions } };
        })
      };
    }));
  };

  const handleUpdateBookingStatus = (id: string, status: 'confirmed' | 'expired') => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const handleCreateSquad = (name: string): string => {
    const squadId = 'squad-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    const newRoom: ChatRoom = {
      id: squadId,
      name,
      description: `Tactical squad created by ${userNickname}`,
      isGlobal: false,
      messages: [
        { 
          id: 'sys-' + Date.now(), 
          senderNickname: 'GarfSystem', 
          text: `Squad ${name} initialized. Secure the link to invite your team.`, 
          timestamp: Date.now(), 
          type: 'text', 
          isSystem: true 
        }
      ]
    };
    setChatRooms(prev => [...prev, newRoom]);
    return squadId;
  };

  const handleJoinSquad = (code: string): boolean => {
    // In a real app, we'd search a database. Here we check our existing list.
    const exists = chatRooms.find(r => r.id === code.toUpperCase() || r.id.includes(code.toUpperCase()));
    if (exists) {
      const joinMsg: ChatMessage = {
        id: 'join-' + Date.now(),
        senderNickname: 'GarfSystem',
        text: `${userNickname} joined the squad via tactical link.`,
        timestamp: Date.now(),
        type: 'text',
        isSystem: true
      };
      setChatRooms(prev => prev.map(room => 
        room.id === exists.id ? { ...room, messages: [...room.messages, joinMsg] } : room
      ));
      return true;
    }
    return false;
  };

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
          chatRooms={chatRooms}
          onLogout={handleLogout} 
          onHubSelect={handleHubSelect} 
          onNavigateHome={() => setView('user')}
          onSendMessage={handleSendMessage}
          onVotePoll={handleVotePoll}
          onCreateSquad={handleCreateSquad}
          onJoinSquad={handleJoinSquad}
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
