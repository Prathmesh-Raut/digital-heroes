import Stripe from "stripe";

import { env, isDemoMode } from "@/lib/env";

let stripe: Stripe | null = null;

export function getStripe() {
  if (isDemoMode || !env.stripeSecretKey) {
    return null;
  }

  if (!stripe) {
    stripe = new Stripe(env.stripeSecretKey);
  }

  return stripe;
}
