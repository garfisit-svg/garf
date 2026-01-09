import React, { useState } from 'react';
import { UserRole } from '../types';
import { supabase } from '../services/supabase';

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
    setLoading(true);
    setError(null);

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
        // Retrieve nickname from metadata
        const userNickname = data.user?.user_metadata?.nickname || 'Player';
        onSuccess(userNickname);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Check your uplink.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617]">
      <div className="bg-[#0b1120] border border-slate-800 p-10 rounded-[40px] w-full max-w-md shadow-2xl relative">
        <button 
          onClick={onBack}
          className="absolute top-8 left-8 text-slate-500 font-bold text-xs flex items-center gap-1 hover:text-slate-300 uppercase tracking-widest"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <div className="mt-8 text-center mb-10">
          <h2 className="text-5xl font-black text-white mb-2 tracking-tighter">
            {mode === 'login' ? 'Welcome' : 'Join Hub'}
          </h2>
          <p className="text-slate-500 text-sm font-black uppercase tracking-widest">
            {type === 'owner' ? 'OWNER PORTAL' : 'CUSTOMER PORTAL'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-black uppercase text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {type === 'user' && mode === 'signup' && (
            <div className="space-y-2">
              <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest block">NICKNAME (SITE ALIAS)</label>
              <input 
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="StarPlayer7"
                className="w-full bg-[#020617] border border-slate-800 text-white rounded-2xl py-4 px-6 focus:border-[#10b981] outline-none transition-all placeholder:text-slate-700"
                required
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
              className="w-full bg-[#020617] border border-slate-800 text-white rounded-2xl py-4 px-6 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700"
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
              className="w-full bg-[#020617] border border-slate-800 text-white rounded-2xl py-4 px-6 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-5 font-black rounded-2xl transition-all shadow-lg text-lg ${
              loading ? 'opacity-50 cursor-not-allowed bg-slate-700' :
              mode === 'login' 
                ? 'bg-[#06b6d4] hover:bg-[#0891b2] text-[#020617] shadow-[0_0_20px_rgba(6,182,212,0.3)]' 
                : 'bg-[#10b981] hover:bg-[#059669] text-[#020617] shadow-[0_0_20px_rgba(16,185,129,0.3)]'
            }`}
          >
            {loading ? 'SYNCING...' : mode === 'login' ? 'Authenticate' : 'Create Identity'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-slate-500 font-black text-xs uppercase tracking-[0.2em] hover:text-slate-300 transition-colors"
          >
            {mode === 'login' ? 'Join System' : 'Already have access? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthView;