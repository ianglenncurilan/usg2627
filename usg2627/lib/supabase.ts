import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

// Standard Supabase client (persists active Admin session)
export const supabase = createClient(supabaseUrl, supabaseKey)

// Separate Supabase auth client for creating new users in auth.users without logging out current Admin
export const supabaseAuthClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})
