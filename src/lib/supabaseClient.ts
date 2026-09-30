import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

// Guarded so the app doesn't crash on import when running in pure-mock mode
// without a .env file. supabaseDataService checks isSupabaseConfigured
// before ever touching this client.
export const supabase = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : (null as unknown as ReturnType<typeof createClient>);
