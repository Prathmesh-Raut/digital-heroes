import { NextResponse } from "next/server";

import { appStore } from "@/lib/app-store";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/api-helpers";
import { donationSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = donationSchema.safeParse(body);

    if (!parsed.success) {
      throw new Error("Please submit a valid charity and donation amount.");
    }

    const user = await getCurrentUser();
    const payment = await appStore.createDonation(
      user?.id ?? null,
      parsed.data.charityId,
      parsed.data.amount,
    );

    return NextResponse.json({ payment });
  } catch (error) {
    return jsonError(error);
  }
}
