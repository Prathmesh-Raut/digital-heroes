import { NextResponse } from "next/server";

import { appStore } from "@/lib/app-store";
import { jsonError, requireApiAdmin } from "@/lib/api-helpers";
import { charityAdminSchema } from "@/lib/validators";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ charityId: string }> },
) {
  try {
    await requireApiAdmin();
    const body = await request.json();
    const { charityId } = await context.params;
    const parsed = charityAdminSchema.safeParse(body);

    if (!parsed.success) {
      throw new Error("Please complete all charity fields.");
    }

    const charity = await appStore.updateCharity(charityId, parsed.data);
    return NextResponse.json({ charity });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ charityId: string }> },
) {
  try {
    await requireApiAdmin();
    const { charityId } = await context.params;
    await appStore.deleteCharity(charityId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
