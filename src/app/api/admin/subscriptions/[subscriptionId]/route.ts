import { NextResponse } from "next/server";

import { appStore } from "@/lib/app-store";
import { jsonError, requireApiAdmin } from "@/lib/api-helpers";
import { subscriptionAdminSchema } from "@/lib/validators";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ subscriptionId: string }> },
) {
  try {
    await requireApiAdmin();
    const body = await request.json();
    const { subscriptionId } = await context.params;
    const parsed = subscriptionAdminSchema.safeParse(body);

    if (!parsed.success) {
      throw new Error("Please provide a valid subscription update.");
    }

    const subscription = await appStore.updateSubscriptionStatus(
      subscriptionId,
      parsed.data.status,
      parsed.data.plan,
    );

    return NextResponse.json({ subscription });
  } catch (error) {
    return jsonError(error);
  }
}
