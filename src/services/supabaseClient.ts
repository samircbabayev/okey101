import { createClient } from '@supabase/supabase-js';

function normalizeSupabaseUrl(url: string): string {
  return url.replace(/\/+$/, '').replace(/\/rest\/v1$/, '');
}

const supabaseUrl = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL ?? '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Set them in your .env file.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey ?? '');
