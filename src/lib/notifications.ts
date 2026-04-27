import { env, isDemoMode } from "@/lib/env";

export async function sendNotificationEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (isDemoMode || !env.emailFrom) {
    console.info("Demo email notification", { to, subject, html });
    return { delivered: false, mode: "demo" as const };
  }

  console.info("Email provider not configured in this scaffold", {
    to,
    subject,
  });

  return { delivered: false, mode: "stub" as const };
}
