import { NextResponse } from "next/server";

import { appStore } from "@/lib/app-store";
import { jsonError, requireApiSubscriber } from "@/lib/api-helpers";
import { scoreCreateSchema } from "@/lib/validators";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ scoreId: string }> },
) {
  try {
    const { user } = await requireApiSubscriber();
    const body = await request.json();
    const parsed = scoreCreateSchema.safeParse(body);

    if (!parsed.success) {
      throw new Error("Scores must be between 1 and 45 with a valid date.");
    }

    const { scoreId } = await context.params;
    const score = await appStore.updateScore(
      user.id,
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
  context: { params: Promise<{ scoreId: string }> },
) {
  try {
    const { user } = await requireApiSubscriber();
    const { scoreId } = await context.params;
    const deleted = await appStore.deleteScore(user.id, scoreId);

    if (!deleted) {
      return NextResponse.json({ error: "Score not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
