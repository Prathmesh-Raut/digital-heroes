import { NextResponse } from "next/server";

import { appStore } from "@/lib/app-store";
import { drawSimulationSchema } from "@/lib/validators";
import { jsonError, requireApiAdmin } from "@/lib/api-helpers";

export async function POST(request: Request) {
  try {
    const admin = await requireApiAdmin();
    const body = await request.json();
    const parsed = drawSimulationSchema.safeParse(body);

    if (!parsed.success) {
      throw new Error("Please send a valid month and draw mode.");
    }

    const result = await appStore.simulateDraw(
      admin.id,
      parsed.data.monthKey,
      parsed.data.mode,
    );

    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
