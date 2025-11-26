import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/clerk-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase environment variables are not configured. Profile fetching will not work. Check your .env file for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

const baseClient = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Create a wrapper to attach Clerk tokens to Supabase requests
export const createSupabaseClient = (clerkToken?: string) => {
  if (!baseClient) return null;
  
  if (clerkToken) {
    // Clone the client with updated auth headers
    return createClient(supabaseUrl!, supabaseKey!, {
      global: {
        headers: {
          Authorization: `Bearer ${clerkToken}`,
        },
      },
    });
  }
  
  return baseClient;
};

export const supabase = baseClient;

export default baseClient;
