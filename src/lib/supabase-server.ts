import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Service-role client — server only, bypasses RLS */
export function createServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

/** Anon client for server components that set app.user_id */
export function createServerClient(userId?: string) {
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    global: {
      headers: userId
        ? { "x-user-id": userId }
        : {},
    },
  });
  return client;
}

let _supabaseService: ReturnType<typeof createServiceClient> | null = null;
export const supabaseService = new Proxy({} as ReturnType<typeof createServiceClient>, {
  get(_, prop) {
    if (!_supabaseService) _supabaseService = createServiceClient();
    return (_supabaseService as unknown as Record<string | symbol, unknown>)[prop];
  },
});
