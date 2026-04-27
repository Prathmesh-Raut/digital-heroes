import { NextResponse } from "next/server";

import { appStore } from "@/lib/app-store";
import { jsonError, requireApiAdmin } from "@/lib/api-helpers";
import { scoreCreateSchema } from "@/lib/validators";

export async function POST(
  request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    await requireApiAdmin();
    const body = await request.json();
    const parsed = scoreCreateSchema.safeParse(body);

    if (!parsed.success) {
      throw new Error("Scores must be between 1 and 45 with a valid date.");
    }

    const { userId } = await context.params;
    const score = await appStore.saveScore(
      userId,
      parsed.data.value,
      parsed.data.playedAt,
    );

    return NextResponse.json({ score });
  } catch (error) {
    return jsonError(error);
  }
}
