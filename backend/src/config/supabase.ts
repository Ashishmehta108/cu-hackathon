import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "https://vcwaeqdbzlbqneekcctk.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjd2FlcWRiemxicW5lZWtjY3RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTU5NzM0OCwiZXhwIjoyMDg3MTczMzQ4fQ.GPNPkdUchLD0VvfvSdfUPO0KaamzsjCsU_07Xa-YxG8"

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
