import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

// The repo does not ship generated Supabase database types yet.
// We keep the admin client loosely typed so runtime store queries can compile.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let adminClient: ReturnType<typeof createClient<any>> | null = null;

export function hasSupabaseAdminConfig() {
  return Boolean(
    env.runtimeMode === "supabase" &&
      env.supabaseUrl &&
      env.supabaseServiceRoleKey,
  );
}

export function getSupabaseAdminClient() {
  if (!hasSupabaseAdminConfig()) {
    return null;
  }

  if (!adminClient) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adminClient = createClient<any>(
      env.supabaseUrl as string,
      env.supabaseServiceRoleKey as string,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  }

  return adminClient;
}
