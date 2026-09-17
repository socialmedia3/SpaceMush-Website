// Supabase browser client configuration.
// This publishable key is safe for frontend use when database RLS is enabled.
const SUPABASE_URL = 'https://zfalvmovzczvzipoodgo.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_VvnVL-2rEGVPHCukw3f6OQ_uwPt2DaW';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
