import { createClient } from '@supabase/supabase-js';

/**
 * Retrieves environment variables with cross-environment compatibility.
 * Prioritizes Vite-prefixed keys (VITE_*) for standard deployments.
 */
const getEnvValue = (key: string): string | undefined => {
  // 1. Try Vite's import.meta.env
  try {
    const metaEnv = (import.meta as any).env;
    if (metaEnv) {
      if (metaEnv[`VITE_${key}`]) return metaEnv[`VITE_${key}`];
      if (metaEnv[key]) return metaEnv[key];
    }
  } catch (e) {}

  // 2. Fallback to process.env
  try {
    if (typeof process !== 'undefined' && process.env) {
      const env = process.env as any;
      if (env[`VITE_${key}`]) return env[`VITE_${key}`];
      if (env[key]) return env[key];
    }
  } catch (e) {}

  return undefined;
};

/**
 * PRODUCTION PROJECT CREDENTIALS
 * ----------------------------
 * Using your provided Supabase project URL and public Anon key.
 * This enables the app to go live and exit Demo Mode.
 */
const SUPABASE_URL = getEnvValue('SUPABASE_URL') || 'https://citrqdtaxakegbrjjzxi.supabase.co';
const SUPABASE_ANON_KEY = getEnvValue('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpdHJxZHRheGFrZWdicmpqenhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NTk3MjcsImV4cCI6MjA4MzUzNTcyN30.oAsHFGPsUAXRa8hTtJif6Iufch8IUol63AtoiWX24Mc';

// Initialize the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Logic to determine if we are in Demo Mode.
 * Returns true if the keys are still pointing to placeholders.
 * Since valid keys are now injected, this will return 'false'.
 */
export const isDemoMode = () => {
  return !SUPABASE_URL || SUPABASE_URL.includes('placeholder-project');
};

// Connection Diagnostic Output
if (isDemoMode()) {
  console.warn("⚠️ SATELLITE LINK: OFFLINE. Using internal mock data (Demo Mode).");
} else {
  console.log("✅ SATELLITE LINK: ACTIVE. Synchronizing with live backend:", SUPABASE_URL);
}
