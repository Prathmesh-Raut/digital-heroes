import { NextResponse } from "next/server";

import { appStore } from "@/lib/app-store";
import { jsonError, requireApiUser } from "@/lib/api-helpers";
import { checkoutSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      throw new Error("Please choose a valid plan.");
    }

    const checkout = await appStore.createCheckout(user.id, parsed.data.plan);
    return NextResponse.json(checkout);
  } catch (error) {
    return jsonError(error);
  }
}
