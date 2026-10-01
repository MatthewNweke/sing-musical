// Only one backend: Supabase.
// There is no mock fallback. If credentials are missing the app throws at startup.
export { supabaseDataService as dataService } from './supabaseDataService';

export const isUsingRealBackend = true;
