import { NextResponse } from "next/server";

import { appStore } from "@/lib/app-store";
import { jsonError, requireApiAdmin } from "@/lib/api-helpers";
import { charityAdminSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    await requireApiAdmin();
    const body = await request.json();
    const parsed = charityAdminSchema.safeParse(body);

    if (!parsed.success) {
      throw new Error("Please complete all charity fields.");
    }

    const charity = await appStore.createCharity(parsed.data);
    return NextResponse.json({ charity });
  } catch (error) {
    return jsonError(error);
  }
}
