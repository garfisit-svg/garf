import { createClient } from '@supabase/supabase-js';

/**
 * Safely retrieves environment variables.
 * In some browser environments, 'process' or 'process.env' might be undefined.
 */
const getSafeEnv = (key: string): string | undefined => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return (process.env as any)[key];
    }
  } catch (e) {
    // Silently fail and return undefined if process is inaccessible
  }
  return undefined;
};

// Fallback values allow the app to boot even if keys aren't configured yet.
const supabaseUrl = getSafeEnv('NEXT_PUBLIC_SUPABASE_URL') || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = getSafeEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || 'placeholder-key';

// Initialize the client. The fallback URL prevents the "supabaseUrl is required" error.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Helper to check if we are in demo mode (using placeholder keys)
 */
export const isDemoMode = () => {
  return supabaseUrl.includes('placeholder-project');
};
