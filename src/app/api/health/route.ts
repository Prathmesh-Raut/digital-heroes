import { NextResponse } from "next/server";

import { env, isDemoMode } from "@/lib/env";
import { hasSupabaseAdminConfig } from "@/lib/supabase/admin";

export function GET() {
  return NextResponse.json({
    ok: true,
    mode: isDemoMode ? "demo" : "supabase",
    runtimeMode: env.runtimeMode,
    services: {
      supabaseBrowserConfigured: Boolean(
        env.supabaseUrl && env.supabaseAnonKey,
      ),
      supabaseAdminConfigured: hasSupabaseAdminConfig(),
      stripeConfigured: Boolean(
        env.stripeSecretKey &&
          env.stripeWebhookSecret &&
          env.stripeMonthlyPriceId &&
          env.stripeYearlyPriceId,
      ),
      emailConfigured: Boolean(env.emailFrom),
    },
  });
}
