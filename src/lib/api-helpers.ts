import { NextResponse } from "next/server";

import { appStore } from "@/lib/app-store";
import { getCurrentUser } from "@/lib/auth";

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export function jsonError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
}

export async function requireApiUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new ApiError("You must be signed in.", 401);
  }

  return user;
}

export async function requireApiAdmin() {
  const user = await requireApiUser();

  if (user.role !== "admin") {
    throw new ApiError("Admin access required.", 403);
  }

  return user;
}

export async function requireApiSubscriber() {
  const user = await requireApiUser();
  const subscription = await appStore.getUserSubscription(user.id);
  const active =
    subscription?.status === "active" || subscription?.status === "renewal_due";

  if (!active) {
    throw new ApiError("An active subscription is required.", 403);
  }

  return { user, subscription };
}
