import { NextResponse } from "next/server";

import { appStore } from "@/lib/app-store";
import { jsonError, requireApiUser } from "@/lib/api-helpers";
import { winnerProofSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await request.json();
    const parsed = winnerProofSchema.safeParse(body);

    if (!parsed.success) {
      throw new Error("Please attach a valid proof image.");
    }

    const claim = await appStore.submitWinnerProof(
      user.id,
      parsed.data.claimId,
      parsed.data.proofImageUrl,
    );

    return NextResponse.json({ claim });
  } catch (error) {
    return jsonError(error);
  }
}
