import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side client with service role (for server actions)
export function createServerClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Browser client for realtime subscriptions
let browserClient: ReturnType<typeof createClient> | null = null;

export function createBrowserClient() {
  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}
