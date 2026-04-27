import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { appStore } from "@/lib/app-store";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import type { PlanInterval } from "@/lib/types";

export async function POST(request: Request) {
  const stripe = getStripe();

  if (!stripe || !env.stripeWebhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 400 },
    );
  }

  const headerStore = await headers();
  const signature = headerStore.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 },
    );
  }

  const rawBody = await request.text();

  try {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.stripeWebhookSecret,
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const metadata = session.metadata ?? {};
      const paidAt = session.created
        ? new Date(session.created * 1000).toISOString()
        : undefined;

      if (
        metadata.type === "subscription" &&
        metadata.userId &&
        (metadata.plan === "monthly" || metadata.plan === "yearly")
      ) {
        await appStore.finalizeSubscriptionCheckout({
          userId: metadata.userId,
          plan: metadata.plan as PlanInterval,
          stripeCustomerId:
            typeof session.customer === "string" ? session.customer : null,
          stripeSubscriptionId:
            typeof session.subscription === "string" ? session.subscription : null,
          stripeReference: session.id,
          paidAt,
        });
      }

      if (metadata.type === "charity" && metadata.charityId) {
        await appStore.finalizeDonationCheckout({
          userId: metadata.userId || null,
          charityId: metadata.charityId,
          amount: Number(metadata.amount ?? 0) || (session.amount_total ?? 0) / 100,
          stripeReference: session.id,
          paidAt,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to process webhook.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
