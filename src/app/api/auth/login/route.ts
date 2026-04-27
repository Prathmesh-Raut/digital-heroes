import { NextResponse } from "next/server";

import { appStore } from "@/lib/app-store";
import { writeSessionCookie } from "@/lib/auth";
import { jsonError } from "@/lib/api-helpers";
import { authSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = authSchema.pick({ email: true, password: true }).safeParse(body);

    if (!parsed.success) {
      throw new Error("Please enter a valid email and password.");
    }

    const user = await appStore.authenticate(
      parsed.data.email,
      parsed.data.password,
    );

    if (!user) {
      return NextResponse.json(
        { error: "Incorrect email or password." },
        { status: 401 },
      );
    }

    await writeSessionCookie(user);

    return NextResponse.json({
      success: true,
      redirectUrl: user.role === "admin" ? "/admin" : "/dashboard",
    });
  } catch (error) {
    return jsonError(error);
  }
}
