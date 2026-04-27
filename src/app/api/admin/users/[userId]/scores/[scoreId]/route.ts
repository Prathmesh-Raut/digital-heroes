import { NextResponse } from "next/server";

import { appStore } from "@/lib/app-store";
import { jsonError, requireApiAdmin } from "@/lib/api-helpers";
import { scoreCreateSchema } from "@/lib/validators";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ userId: string; scoreId: string }> },
) {
  try {
    await requireApiAdmin();
    const body = await request.json();
    const parsed = scoreCreateSchema.safeParse(body);

    if (!parsed.success) {
      throw new Error("Scores must be between 1 and 45 with a valid date.");
    }

    const { userId, scoreId } = await context.params;
    const score = await appStore.updateScore(
      userId,
      scoreId,
      parsed.data.value,
      parsed.data.playedAt,
    );

    return NextResponse.json({ score });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ userId: string; scoreId: string }> },
) {
  try {
    await requireApiAdmin();
    const { userId, scoreId } = await context.params;
    const deleted = await appStore.deleteScore(userId, scoreId);

    if (!deleted) {
      return NextResponse.json({ error: "Score not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
