import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

async function testAuth() {
  console.log("Testing connection to:", process.env.SUPABASE_URL);
  
  // Try to sign in with a fake user just to see if the network is reachable
  const { error } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'fakepassword123'
  });

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      console.log("✅ Network connection successful. Supabase API is fully reachable.");
    } else {
      console.log("❌ Supabase returned an error:", error.message);
    }
  } else {
    console.log("✅ Network connection successful.");
  }
}

testAuth();
