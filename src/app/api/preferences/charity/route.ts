import { NextResponse } from "next/server";

import { appStore } from "@/lib/app-store";
import { jsonError, requireApiUser } from "@/lib/api-helpers";
import { charityPreferenceSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await request.json();
    const parsed = charityPreferenceSchema.safeParse(body);

    if (!parsed.success) {
      throw new Error("Please choose a valid charity and contribution percent.");
    }

    const updatedUser = await appStore.updateCharityPreference(
      user.id,
      parsed.data.charityId,
      parsed.data.charityContributionPercent,
    );

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    return jsonError(error);
  }
}
