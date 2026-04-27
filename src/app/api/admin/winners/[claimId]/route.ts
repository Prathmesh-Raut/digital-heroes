import { NextResponse } from "next/server";

import { appStore } from "@/lib/app-store";
import { jsonError, requireApiAdmin } from "@/lib/api-helpers";
import { winnerReviewSchema } from "@/lib/validators";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ claimId: string }> },
) {
  try {
    const admin = await requireApiAdmin();
    const body = await request.json();
    const { claimId } = await context.params;
    const parsed = winnerReviewSchema.safeParse({
      ...body,
      claimId,
    });

    if (!parsed.success) {
      throw new Error("Please provide a valid review decision.");
    }

    const claim = await appStore.reviewWinnerClaim({
      claimId: parsed.data.claimId,
      adminId: admin.id,
      verificationStatus: parsed.data.verificationStatus,
      payoutStatus: parsed.data.payoutStatus,
      notes: parsed.data.notes,
    });

    return NextResponse.json({ claim });
  } catch (error) {
    return jsonError(error);
  }
}
