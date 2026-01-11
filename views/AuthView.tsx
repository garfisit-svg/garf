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

  const isOwnerTheme = type === 'owner';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isDemoMode()) {
      setError("Connection Error: Satellite link required.");
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
              nickname: type === 'user' ? (nickname || 'Player') : 'Owner',
              role: type
            }
          }
        });
        
        if (signUpError) throw signUpError;
        
        if (data.user && data.session) {
           onSuccess(nickname || (type === 'owner' ? 'Owner' : 'Player'));
        } else {
           setError("Registration successful. Check your inbox to verify your account.");
           setMode('login');
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) throw signInError;
        
        const userNickname = data.user?.user_metadata?.nickname || (type === 'owner' ? 'Owner' : 'Player');
        onSuccess(userNickname);
      }
    } catch (err: any) {
      setError(err.message || "Link failed during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 bg-[#020617]`}>
      <div className={`border p-10 rounded-[40px] w-full max-w-md shadow-2xl relative overflow-hidden transition-all duration-500 ${
        isOwnerTheme 
          ? 'bg-[#0f172a] border-emerald-900/50 shadow-emerald-500/10' 
          : 'bg-[#0b1120] border-slate-800 shadow-cyan-500/10'
      }`}>
        <button 
          onClick={onBack}
          className="absolute top-8 left-8 text-slate-500 font-black text-[10px] flex items-center gap-1 hover:text-slate-300 uppercase tracking-widest z-10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <div className="mt-8 text-center mb-10 relative z-10">
          <h2 className={`text-5xl font-black mb-2 tracking-tighter uppercase ${isOwnerTheme ? 'text-emerald-400' : 'text-white'}`}>
            {mode === 'login' ? 'Welcome' : 'Join'}
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
            {type === 'owner' ? 'Owner Terminal Access' : 'Player Access Node'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-5 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400 text-[11px] font-bold text-center leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {type === 'user' && mode === 'signup' && (
            <div className="space-y-2">
              <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest block">Display Nickname</label>
              <input 
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="StarPlayer7"
                className={`w-full bg-[#020617] border border-slate-800 text-white rounded-2xl py-4 px-6 outline-none transition-all placeholder:text-slate-700 font-bold ${
                  isOwnerTheme ? 'focus:border-emerald-500' : 'focus:border-cyan-500'
                }`}
                required={mode === 'signup' && type === 'user'}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest block">Email Address</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className={`w-full bg-[#020617] border border-slate-800 text-white rounded-2xl py-4 px-6 outline-none transition-all placeholder:text-slate-700 font-bold ${
                isOwnerTheme ? 'focus:border-emerald-500' : 'focus:border-cyan-500'
              }`}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest block">Security Key (Password)</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full bg-[#020617] border border-slate-800 text-white rounded-2xl py-4 px-6 outline-none transition-all placeholder:text-slate-700 font-bold ${
                isOwnerTheme ? 'focus:border-emerald-500' : 'focus:border-cyan-500'
              }`}
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-5 font-black rounded-2xl transition-all shadow-lg text-lg uppercase tracking-widest ${
              loading ? 'opacity-50 cursor-not-allowed bg-slate-700' :
              isOwnerTheme 
                ? 'bg-emerald-500 text-[#020617] shadow-emerald-500/20 hover:bg-emerald-400' 
                : 'bg-cyan-500 text-[#020617] shadow-cyan-500/20 hover:bg-cyan-400'
            }`}
          >
            {loading ? 'Transmitting...' : mode === 'login' ? 'Enter Arena' : 'Initialize Profile'}
          </button>
        </form>

        <div className="mt-8 text-center relative z-10">
          <button 
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
            className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] hover:text-slate-300 transition-colors"
          >
            {mode === 'login' ? "New identity? Register here" : "Known user? Sign in here"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthView;