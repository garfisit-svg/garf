import React, { useState } from 'react';
import { UserRole } from '../types';
import { supabase, isDemoMode } from '../services/supabase';

interface AuthViewProps {
  type: UserRole;
  onBack: () => void;
  onSuccess: (nickname?: string) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ type, onBack, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Guard against placeholder keys
    if (isDemoMode()) {
      setError("COMMUNICATION BLOCKED: SUPABASE KEYS NOT DETECTED. PLEASE CONFIGURE 'SUPABASE_URL' AND 'SUPABASE_ANON_KEY' IN YOUR ENVIRONMENT SETTINGS TO GO LIVE.");
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nickname: type === 'user' ? nickname : 'Owner',
              role: type
            }
          }
        });
        if (signUpError) throw signUpError;
        onSuccess(nickname || 'Player');
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        const userNickname = data.user?.user_metadata?.nickname || 'Player';
        onSuccess(userNickname);
      }
    } catch (err: any) {
      console.error("Auth error detail:", err);
      // Detailed diagnostics for common network errors
      if (err.message === "Failed to fetch" || err.name === "TypeError") {
        setError("SATELLITE LINK TIMEOUT: UNABLE TO REACH YOUR SUPABASE PROJECT. VERIFY YOUR PROJECT URL (MUST START WITH HTTPS://) AND ENSURE YOUR PROJECT IS NOT PAUSED.");
      } else {
        setError(err.message || "AUTHENTICATION FAILED. CHECK YOUR UPLINK.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617]">
      <div className="bg-[#0b1120] border border-slate-800 p-10 rounded-[40px] w-full max-w-md shadow-2xl relative overflow-hidden">
        {error && isDemoMode() && (
          <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none"></div>
        )}

        <button 
          onClick={onBack}
          className="absolute top-8 left-8 text-slate-500 font-bold text-xs flex items-center gap-1 hover:text-slate-300 uppercase tracking-widest z-10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <div className="mt-8 text-center mb-10 relative z-10">
          <h2 className="text-5xl font-black text-white mb-2 tracking-tighter">
            {mode === 'login' ? 'Welcome' : 'Join Hub'}
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isDemoMode() ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
              {isDemoMode() ? 'OFFLINE / NO KEYS' : 'SATELLITE LINK ACTIVE'}
            </p>
          </div>
        </div>

        {error && (
          <div className={`mb-8 p-6 rounded-2xl border text-[10px] font-black uppercase text-center leading-relaxed tracking-widest relative z-10 animate-in fade-in slide-in-from-top-2 duration-300 ${
            isDemoMode() ? 'bg-red-500/10 border-red-500/40 text-red-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            <svg className="w-6 h-6 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {type === 'user' && mode === 'signup' && (
            <div className="space-y-2">
              <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest block">NICKNAME (SITE ALIAS)</label>
              <input 
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="StarPlayer7"
                className="w-full bg-[#020617] border border-slate-800 text-white rounded-2xl py-4 px-6 focus:border-[#10b981] outline-none transition-all placeholder:text-slate-700 font-bold"
                required={mode === 'signup' && type === 'user'}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest block">IDENTITY (EMAIL)</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-[#020617] border border-slate-800 text-white rounded-2xl py-4 px-6 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700 font-bold"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest block">ACCESS KEY (PASSWORD)</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#020617] border border-slate-800 text-white rounded-2xl py-4 px-6 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700 font-bold"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-5 font-black rounded-2xl transition-all shadow-lg text-lg uppercase tracking-widest ${
              loading ? 'opacity-50 cursor-not-allowed bg-slate-700' :
              mode === 'login' 
                ? 'bg-[#06b6d4] hover:bg-[#0891b2] text-[#020617] shadow-[0_0_20px_rgba(6,182,212,0.3)]' 
                : 'bg-[#10b981] hover:bg-[#059669] text-[#020617] shadow-[0_0_20px_rgba(16,185,129,0.3)]'
            }`}
          >
            {loading ? 'INITIALIZING...' : mode === 'login' ? 'Authenticate' : 'Create Identity'}
          </button>
        </form>

        <div className="mt-8 text-center relative z-10">
          <button 
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
            className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] hover:text-slate-300 transition-colors"
          >
            {mode === 'login' ? 'New here? Establish Account' : 'Returning? Access System'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthView;