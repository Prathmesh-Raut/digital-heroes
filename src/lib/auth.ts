import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

import { appStore } from "@/lib/app-store";
import { SESSION_COOKIE } from "@/lib/constants";
import { env } from "@/lib/env";
import type { SessionPayload, UserRecord } from "@/lib/types";

const secretKey = new TextEncoder().encode(env.authSecret);

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, secretKey);
  if (
    typeof payload.userId !== "string" ||
    typeof payload.role !== "string" ||
    typeof payload.email !== "string"
  ) {
    throw new Error("Invalid session payload.");
  }

  return payload as unknown as SessionPayload;
}

export async function writeSessionCookie(user: UserRecord) {
  const cookieStore = await cookies();
  const token = await createSessionToken({
    userId: user.id,
    role: user.role,
    email: user.email,
  });

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = await verifySessionToken(token);
    return (await appStore.getUserById(payload.userId)) ?? null;
  } catch {
    return null;
  }
}
