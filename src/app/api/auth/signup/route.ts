import { NextResponse } from "next/server";

import { appStore } from "@/lib/app-store";
import { writeSessionCookie } from "@/lib/auth";
import { jsonError } from "@/lib/api-helpers";
import { authSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = authSchema.safeParse(body);

    if (
      !parsed.success ||
      !parsed.data.fullName ||
      !parsed.data.charityId ||
      !parsed.data.charityContributionPercent ||
      !parsed.data.plan
    ) {
      throw new Error("Please complete every signup field.");
    }

    const user = await appStore.createUser({
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      password: parsed.data.password,
      charityId: parsed.data.charityId,
      charityContributionPercent: parsed.data.charityContributionPercent,
      plan: parsed.data.plan,
    });

    await writeSessionCookie(user);

    return NextResponse.json({ success: true, redirectUrl: "/dashboard" });
  } catch (error) {
    return jsonError(error);
  }
}
