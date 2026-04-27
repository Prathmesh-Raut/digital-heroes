import { redirect } from "next/navigation";

import { appStore } from "@/lib/app-store";
import { getCurrentUser } from "@/lib/auth";

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return user;
}

export async function getViewerContext() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      subscription: null,
      hasActiveSubscription: false,
    };
  }

  const subscription = await appStore.getUserSubscription(user.id);

  return {
    user,
    subscription,
    hasActiveSubscription:
      subscription?.status === "active" || subscription?.status === "renewal_due",
  };
}
