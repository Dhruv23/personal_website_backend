import { createClient } from '@supabase/supabase-js';

// If running in the browser, these must be NEXT_PUBLIC_...
// If on the server, we can use the private keys if needed, but for simplicity here we use the public ones.
// NOTE: Make sure to set these in your .env.local file!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or Key is missing. Check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
