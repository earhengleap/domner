//supabase/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";
import { Database } from "./type";
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zepaucxftwzifiuogfxj.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplcGF1Y3hmdHd6aWZpdW9nZnhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgzNTY5NTcsImV4cCI6MjA0MzkzMjk1N30.FiHPdR-aYeIjWfCPa4npInedyd3Y2pefkdkC9UAcD94";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      headers: {
        'Cache-Control': 'no-store',
        'Pragma': 'no-cache'
      }
    }
  });

  export const serviceSupabase = createClient(supabaseUrl, supabaseServiceRoleKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
  
  // Add this function to test the connection
  export async function testSupabaseConnection() {
    try {
      const { data: testData, error: testError } = await supabase.storage
        .from('profiles')
        .list();
  
      if (testError) throw testError;
      
      console.log('Supabase connection test successful:', testData);
      return true;
    } catch (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
  }

export { createClient };
