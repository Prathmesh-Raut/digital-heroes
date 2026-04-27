import { NextResponse } from "next/server";

import { appStore } from "@/lib/app-store";
import { jsonError, requireApiAdmin } from "@/lib/api-helpers";
import { adminUserUpdateSchema } from "@/lib/validators";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    await requireApiAdmin();
    const body = await request.json();
    const parsed = adminUserUpdateSchema.safeParse(body);

    if (!parsed.success) {
      throw new Error("Please provide a complete user profile.");
    }

    const { userId } = await context.params;
    const user = await appStore.updateUserProfile(userId, parsed.data);

    return NextResponse.json({ user });
  } catch (error) {
    return jsonError(error);
  }
}
