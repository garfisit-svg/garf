import { createClient } from '@supabase/supabase-js';

/**
 * Robustly retrieves environment variables from various possible locations.
 * Vite projects usually use import.meta.env.VITE_*, 
 * while other environments might use process.env.NEXT_PUBLIC_* or process.env.*
 */
const getSafeEnv = (key: string): string | undefined => {
  // Try Vite's import.meta.env (Common for modern Vite setups)
  try {
    const metaEnv = (import.meta as any).env;
    if (metaEnv) {
      if (metaEnv[`VITE_${key}`]) return metaEnv[`VITE_${key}`];
      if (metaEnv[`NEXT_PUBLIC_${key}`]) return metaEnv[`NEXT_PUBLIC_${key}`];
      if (metaEnv[key]) return metaEnv[key];
    }
  } catch (e) {}

  // Try standard process.env
  try {
    if (typeof process !== 'undefined' && process.env) {
      const env = process.env as any;
      if (env[`VITE_${key}`]) return env[`VITE_${key}`];
      if (env[`NEXT_PUBLIC_${key}`]) return env[`NEXT_PUBLIC_${key}`];
      if (env[key]) return env[key];
    }
  } catch (e) {}

  return undefined;
};

// Primary keys
const supabaseUrl = getSafeEnv('SUPABASE_URL') || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = getSafeEnv('SUPABASE_ANON_KEY') || 'placeholder-key';

// Initialize the client. 
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Helper to check if we are in demo mode (using placeholder keys)
 */
export const isDemoMode = () => {
  return supabaseUrl.includes('placeholder-project') || supabaseAnonKey === 'placeholder-key';
};