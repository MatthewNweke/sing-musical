import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { mockDataService } from './mockDataService';
import { supabaseDataService } from './supabaseDataService';
import type { DataService } from './dataService';

const wantsSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';

if (wantsSupabase && !isSupabaseConfigured) {
  // Fail loudly in dev rather than silently falling back — a half-configured
  // backend is worse than an obvious error.
  // eslint-disable-next-line no-console
  console.warn(
    '[sing-musically] VITE_USE_SUPABASE is true but VITE_SUPABASE_URL/ANON_KEY are missing. Falling back to mock data.',
  );
}

export const dataService: DataService =
  wantsSupabase && isSupabaseConfigured ? supabaseDataService : mockDataService;

export const isUsingRealBackend = wantsSupabase && isSupabaseConfigured;
