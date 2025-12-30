
import React, { useState, useEffect } from 'react';
import { UserRole, Hub } from './types';
import { MOCK_HUBS } from './constants';
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

  const handleStartAuth = (role: UserRole) => {
    setAuthType(role);
    setView('auth');
  };

  const handleAuthSuccess = () => {
    setView(authType === 'owner' ? 'owner' : 'user');
  };

  const handleHubSelect = (hub: Hub) => {
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

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      {view === 'landing' && <LandingView onStartAuth={handleStartAuth} onBrowseGuest={() => setView('user')} />}
      {view === 'auth' && <AuthView type={authType} onBack={handleBack} onSuccess={handleAuthSuccess} />}
      {view === 'user' && (
        <UserDashboard 
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
        />
      )}
      {view === 'owner' && (
        <OwnerDashboard 
          onLogout={handleLogout} 
          onAddHub={handleAddHub}
          onEditHub={handleEditHub}
          onNavigateHome={() => setView('owner')}
        />
      )}
      {view === 'hub-register' && (
        <HubRegisterView 
          onBack={handleBack} 
          onLogout={handleLogout} 
          onNavigateHome={() => setView('owner')} 
          hubToEdit={editingHub || undefined}
        />
      )}
    </div>
  );
};

export default App;
