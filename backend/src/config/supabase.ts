import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = "https://vcwaeqdbzlbqneekcctk.supabase.co"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjd2FlcWRiemxicW5lZWtjY3RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1OTczNDgsImV4cCI6MjA4NzE3MzM0OH0.7S6o1rR3sOmSjS4bFcpSFK_uJmjdBsgQGhFz8XnTgQk";

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌  Supabase: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
    throw new Error('Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.');
}

console.log(`✅  Supabase: connecting to ${supabaseUrl}`);

// Use service role key on the backend (bypasses RLS — keep this server-side only!)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

export default supabase;
