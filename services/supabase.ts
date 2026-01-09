import { createClient } from '@supabase/supabase-js';

// These variables must be set in your Environment Variables on Vercel or your hosting provider.
// We provide a fallback string to prevent the "supabaseUrl is required" crash during initialization
// if the environment variables haven't been configured yet.
const supabaseUrl = (process.env as any).NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-please-set-your-url.supabase.co';
const supabaseAnonKey = (process.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-please-set-your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
