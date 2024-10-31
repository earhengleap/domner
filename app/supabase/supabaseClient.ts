//supabase/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";
import { Database } from "./type";
const supabaseUrl = "https://zepaucxftwzifiuogfxj.supabase.co";
const supabaseKey ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplcGF1Y3hmdHd6aWZpdW9nZnhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgzNTY5NTcsImV4cCI6MjA0MzkzMjk1N30.FiHPdR-aYeIjWfCPa4npInedyd3Y2pefkdkC9UAcD94";

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
