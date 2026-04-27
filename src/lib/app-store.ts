import { Buffer } from "node:buffer";

import { DEFAULT_CURRENCY, MIN_CHARITY_PERCENT, PLAN_DEFINITIONS } from "@/lib/constants";
import { demoStore } from "@/lib/demo-store";
import { getMatchCount, runDrawEngine } from "@/lib/draw-engine";
import { env } from "@/lib/env";
import { formatMonthLabel } from "@/lib/format";
import { sendNotificationEmail } from "@/lib/notifications";
import { hashPassword, verifyPassword } from "@/lib/passwords";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  AdminSnapshot,
  CharityEventRecord,
  CharityRecord,
  DashboardSnapshot,
  DrawMode,
  DrawRecord,
  MatchTier,
  PaymentRecord,
  PlanInterval,
  ScoreRecord,
  SubscriptionRecord,
  UserRecord,
  VerificationStatus,
  WinnerClaimRecord,
} from "@/lib/types";

const proofBucket = "winner-proofs";

function toCents(amount: number) {
  return Math.round(amount * 100);
}

function fromCents(amountCents?: number | null) {
  return (amountCents ?? 0) / 100;
}

function nowIso() {
  return new Date().toISOString();
}

function planAmount(plan: PlanInterval) {
  return PLAN_DEFINITIONS.find((item) => item.id === plan)?.amount ?? 0;
}

function normalizeMonthKey(monthKey: string) {
  return `${monthKey}-01`;
}

function isExternalUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:");
}

function unwrap<T>(
  result: { data: T; error: { message: string } | null },
  fallbackMessage?: string,
) {
  if (result.error) {
    throw new Error(fallbackMessage ?? result.error.message);
  }

  return result.data;
}

function mapCharity(row: Record<string, unknown>): CharityRecord {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    category: String(row.category),
    country: String(row.country),
    description: String(row.description),
    mission: String(row.mission),
    imageUrl: String(row.image_url),
    spotlight: Boolean(row.spotlight),
    impactBlurb: String(row.impact_blurb),
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    websiteUrl: String(row.website_url),
  };
}

function mapCharityEvent(row: Record<string, unknown>): CharityEventRecord {
  return {
    id: String(row.id),
    charityId: String(row.charity_id),
    title: String(row.title),
    startsAt: String(row.starts_at),
    location: String(row.location),
    summary: String(row.summary),
  };
}

function mapUser(row: Record<string, unknown>): UserRecord {
  return {
    id: String(row.id),
    email: String(row.email),
    fullName: String(row.full_name),
    passwordHash: String(row.password_hash),
    role: row.role as UserRecord["role"],
    country: String(row.country),
    selectedCharityId: String(row.selected_charity_id),
    charityContributionPercent: Number(row.charity_contribution_percent),
    avatarUrl: row.avatar_url ? String(row.avatar_url) : "",
    createdAt: String(row.created_at),
  };
}

function mapSubscription(row: Record<string, unknown>): SubscriptionRecord {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    plan: row.plan as PlanInterval,
    status: row.status as SubscriptionRecord["status"],
    amount: fromCents(Number(row.amount_cents)),
    currency: String(row.currency_code),
    startedAt: String(row.started_at),
    renewsAt: String(row.renews_at),
    cancelledAt: row.cancelled_at ? String(row.cancelled_at) : null,
    stripeCustomerId: row.stripe_customer_id ? String(row.stripe_customer_id) : null,
    stripeSubscriptionId: row.stripe_subscription_id
      ? String(row.stripe_subscription_id)
      : null,
  };
}

function mapScore(row: Record<string, unknown>): ScoreRecord {
  const playedAt = String(row.played_at);

  return {
    id: String(row.id),
    userId: String(row.user_id),
    value: Number(row.stableford_score),
    playedAt: `${playedAt}T00:00:00.000Z`,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapPayment(row: Record<string, unknown>): PaymentRecord {
  return {
    id: String(row.id),
    userId: row.user_id ? String(row.user_id) : null,
    subscriptionId: row.subscription_id ? String(row.subscription_id) : null,
    charityId: row.charity_id ? String(row.charity_id) : null,
    drawId: row.draw_id ? String(row.draw_id) : null,
    kind: row.kind as PaymentRecord["kind"],
    status: row.status as PaymentRecord["status"],
    amount: fromCents(Number(row.amount_cents)),
    charityAmount:
      row.charity_amount_cents === null || row.charity_amount_cents === undefined
        ? undefined
        : fromCents(Number(row.charity_amount_cents)),
    currency: String(row.currency_code),
    stripeReference: row.stripe_reference ? String(row.stripe_reference) : null,
    description: String(row.description),
    createdAt: String(row.created_at),
  };
}

function mapNotification(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    subject: String(row.subject),
    body: String(row.body),
    createdAt: String(row.created_at),
  };
}

async function maybeResolveProofUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  if (isExternalUrl(value)) {
    return value;
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return value;
  }

  const result = await supabase.storage
    .from(proofBucket)
    .createSignedUrl(value, 60 * 60);

  if (result.error || !result.data?.signedUrl) {
    return value;
  }

  return result.data.signedUrl;
}

async function mapWinnerClaim(row: Record<string, unknown>): Promise<WinnerClaimRecord> {
  return {
    id: String(row.id),
    drawId: String(row.draw_id),
    userId: String(row.user_id),
    matchTier: Number(row.match_tier) as MatchTier,
    amount: fromCents(Number(row.amount_cents)),
    verificationStatus: row.verification_status as VerificationStatus,
    payoutStatus: row.payout_status as WinnerClaimRecord["payoutStatus"],
    proofImageUrl: await maybeResolveProofUrl(
      row.proof_image_url ? String(row.proof_image_url) : null,
    ),
    submittedAt: row.submitted_at ? String(row.submitted_at) : null,
    reviewedAt: row.reviewed_at ? String(row.reviewed_at) : null,
    reviewedByUserId: row.reviewed_by_user_id ? String(row.reviewed_by_user_id) : null,
    paidAt: row.paid_at ? String(row.paid_at) : null,
    notes: row.notes ? String(row.notes) : null,
  };
}

async function hydrateDrawRows(drawRows: Record<string, unknown>[]) {
  if (!drawRows.length) {
    return [] as DrawRecord[];
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return [];
  }

  const drawIds = drawRows.map((row) => String(row.id));
  const [numberRows, entryRows] = await Promise.all([
    unwrap(
      await supabase
        .from("draw_numbers")
        .select("*")
        .in("draw_id", drawIds)
        .order("position", { ascending: true }),
    ),
    unwrap(await supabase.from("draw_entries").select("*").in("draw_id", drawIds)),
  ]);

  const numbersByDrawId = new Map<string, number[]>();
  for (const row of numberRows as Record<string, unknown>[]) {
    const drawId = String(row.draw_id);
    const current = numbersByDrawId.get(drawId) ?? [];
    current.push(Number(row.stableford_score));
    numbersByDrawId.set(drawId, current);
  }

  const participantsByDrawId = new Map<string, string[]>();
  for (const row of entryRows as Record<string, unknown>[]) {
    const drawId = String(row.draw_id);
    const current = participantsByDrawId.get(drawId) ?? [];
    current.push(String(row.user_id));
    participantsByDrawId.set(drawId, current);
  }

  return drawRows.map((row) => ({
    id: String(row.id),
    monthKey: String(row.month_key).slice(0, 7),
    label: String(row.label),
    mode: row.mode as DrawMode,
    status: row.status as DrawRecord["status"],
    numbers: numbersByDrawId.get(String(row.id)) ?? [],
    createdByUserId: String(row.created_by_user_id),
    participantUserIds:
      participantsByDrawId.get(String(row.id)) ??
      Array.from(
        { length: Number(row.participant_count ?? 0) },
        (_, index) => `participant-${index + 1}`,
      ),
    prizePool: {
      tier3: fromCents(Number(row.prize_pool_tier3_cents)),
      tier4: fromCents(Number(row.prize_pool_tier4_cents)),
      tier5: fromCents(Number(row.prize_pool_tier5_cents)),
      total: fromCents(Number(row.prize_pool_total_cents)),
    },
    jackpotRolloverIn: fromCents(Number(row.jackpot_rollover_in_cents)),
    jackpotRolloverOut: fromCents(Number(row.jackpot_rollover_out_cents)),
    simulatedAt: row.simulated_at ? String(row.simulated_at) : null,
    publishedAt: row.published_at ? String(row.published_at) : null,
    notes: row.notes ? String(row.notes) : undefined,
  }));
}

async function getSupabaseCharities() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return demoStore.getCharities();
  }

  const rows = unwrap(
    await supabase
      .from("charities")
      .select("*")
      .order("spotlight", { ascending: false })
      .order("name", { ascending: true }),
  );

  return (rows as Record<string, unknown>[]).map(mapCharity);
}

async function getSupabaseCharityEvents(charityId?: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return demoStore.getCharityEvents(charityId);
  }

  let query = supabase
    .from("charity_events")
    .select("*")
    .order("starts_at", { ascending: true });

  if (charityId) {
    query = query.eq("charity_id", charityId);
  }

  const rows = unwrap(await query);
  return (rows as Record<string, unknown>[]).map(mapCharityEvent);
}

async function getSupabaseUserById(userId: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return demoStore.getUserById(userId);
  }

  const row = unwrap(
    await supabase.from("app_users").select("*").eq("id", userId).maybeSingle(),
  );

  return row ? mapUser(row as Record<string, unknown>) : null;
}

async function getSupabaseUserByEmail(email: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return demoStore.getUserByEmail(email);
  }

  const row = unwrap(
    await supabase
      .from("app_users")
      .select("*")
      .ilike("email", email)
      .maybeSingle(),
  );

  return row ? mapUser(row as Record<string, unknown>) : null;
}

async function getSupabaseUserSubscription(userId: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return demoStore.getUserSubscription(userId);
  }

  const rows = unwrap(
    await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("renews_at", { ascending: false })
      .limit(1),
  );

  const row = (rows as Record<string, unknown>[])[0];
  return row ? mapSubscription(row) : null;
}

async function getSupabaseLatestScores(userId: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return demoStore.getLatestScores(userId);
  }

  const rows = unwrap(
    await supabase
      .from("scores")
      .select("*")
      .eq("user_id", userId)
      .order("played_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5),
  );

  return (rows as Record<string, unknown>[]).map(mapScore);
}

async function getSupabaseAdminSnapshot(): Promise<AdminSnapshot> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return demoStore.getAdminSnapshot();
  }

  const [
    charityRows,
    eventRows,
    userRows,
    subscriptionRows,
    scoreRows,
    drawRows,
    winnerRows,
    paymentRows,
  ] = await Promise.all([
    unwrap(await supabase.from("charities").select("*").order("name")),
    unwrap(await supabase.from("charity_events").select("*").order("starts_at")),
    unwrap(await supabase.from("app_users").select("*").order("created_at")),
    unwrap(await supabase.from("subscriptions").select("*").order("started_at", { ascending: false })),
    unwrap(await supabase.from("scores").select("*").order("played_at", { ascending: false })),
    unwrap(await supabase.from("draws").select("*").order("month_key", { ascending: false })),
    unwrap(await supabase.from("winner_claims").select("*").order("created_at", { ascending: false })),
    unwrap(await supabase.from("payments").select("*").order("created_at", { ascending: false })),
  ]);

  return {
    charities: (charityRows as Record<string, unknown>[]).map(mapCharity),
    charityEvents: (eventRows as Record<string, unknown>[]).map(mapCharityEvent),
    users: (userRows as Record<string, unknown>[]).map(mapUser),
    subscriptions: (subscriptionRows as Record<string, unknown>[]).map(mapSubscription),
    scores: (scoreRows as Record<string, unknown>[]).map(mapScore),
    draws: await hydrateDrawRows(drawRows as Record<string, unknown>[]),
    winners: await Promise.all(
      (winnerRows as Record<string, unknown>[]).map(mapWinnerClaim),
    ),
    payments: (paymentRows as Record<string, unknown>[]).map(mapPayment),
  };
}

async function getSupabaseDashboardSnapshot(userId: string): Promise<DashboardSnapshot> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return demoStore.getDashboardSnapshot(userId);
  }

  const user = await getSupabaseUserById(userId);
  if (!user) {
    throw new Error("User not found.");
  }

  const [
    subscription,
    scores,
    charities,
    charityEvents,
    drawEntryRows,
    winnerRows,
    paymentRows,
    notificationRows,
  ] = await Promise.all([
    getSupabaseUserSubscription(userId),
    getSupabaseLatestScores(userId),
    getSupabaseCharities(),
    getSupabaseCharityEvents(),
    unwrap(await supabase.from("draw_entries").select("draw_id").eq("user_id", userId)),
    unwrap(
      await supabase
        .from("winner_claims")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ),
    unwrap(
      await supabase
        .from("payments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ),
    unwrap(
      await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ),
  ]);

  const drawIds = new Set<string>();
  for (const row of drawEntryRows as Array<{ draw_id: string }>) {
    drawIds.add(row.draw_id);
  }
  for (const row of winnerRows as Array<{ draw_id: string }>) {
    drawIds.add(row.draw_id);
  }

  const drawRows =
    drawIds.size > 0
      ? unwrap(
          await supabase
            .from("draws")
            .select("*")
            .in("id", Array.from(drawIds))
            .order("month_key", { ascending: false }),
        )
      : [];

  return {
    user,
    subscription,
    scores,
    charities,
    charityEvents,
    draws: await hydrateDrawRows(drawRows as Record<string, unknown>[]),
    winners: await Promise.all(
      (winnerRows as Record<string, unknown>[]).map(mapWinnerClaim),
    ),
    payments: (paymentRows as Record<string, unknown>[]).map(mapPayment),
    notifications: (notificationRows as Record<string, unknown>[]).map(mapNotification),
  };
}

async function getActiveEntrants() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return demoStore
      .getAdminSnapshot()
      .subscriptions.filter((subscription) =>
        ["active", "renewal_due"].includes(subscription.status),
      )
      .map((subscription) => ({
        userId: subscription.userId,
        scores: demoStore.getLatestScores(subscription.userId).map((score) => score.value),
      }));
  }

  const subscriptionRows = unwrap(
    await supabase
      .from("subscriptions")
      .select("user_id")
      .in("status", ["active", "renewal_due"]),
  );

  const userIds = Array.from(
    new Set((subscriptionRows as Array<{ user_id: string }>).map((row) => row.user_id)),
  );

  if (!userIds.length) {
    return [];
  }

  const scoreRows = unwrap(
    await supabase
      .from("scores")
      .select("*")
      .in("user_id", userIds)
      .order("played_at", { ascending: false })
      .order("created_at", { ascending: false }),
  );

  const scoresByUserId = new Map<string, number[]>();
  for (const row of scoreRows as Record<string, unknown>[]) {
    const userId = String(row.user_id);
    const current = scoresByUserId.get(userId) ?? [];
    if (current.length < 5) {
      current.push(Number(row.stableford_score));
    }
    scoresByUserId.set(userId, current);
  }

  return userIds.map((userId) => ({
    userId,
    scores: scoresByUserId.get(userId) ?? [],
  }));
}

async function getLatestPublishedRollover() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return demoStore.getCurrentJackpotRollover();
  }

  const rows = unwrap(
    await supabase
      .from("draws")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(1),
  );

  const row = (rows as Record<string, unknown>[])[0];
  return row ? fromCents(Number(row.jackpot_rollover_out_cents)) : 0;
}

async function getMonthlyRecurringRevenueValue() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return demoStore.getMonthlyRecurringRevenue();
  }

  const rows = unwrap(
    await supabase
      .from("subscriptions")
      .select("*")
      .in("status", ["active", "renewal_due"]),
  );

  return (rows as Record<string, unknown>[]).reduce((sum, row) => {
    const amount = fromCents(Number(row.amount_cents));
    return sum + (row.plan === "yearly" ? amount / 12 : amount);
  }, 0);
}

async function createDrawRecord(input: {
  adminId: string;
  monthKey: string;
  mode: DrawMode;
  status: "simulated" | "published";
  participantCount: number;
  prizePool: { tier3: number; tier4: number; tier5: number; total: number };
  jackpotRolloverIn: number;
  jackpotRolloverOut: number;
  notes?: string;
  simulatedAt?: string;
  publishedAt?: string;
  numbers: number[];
}) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const insertedDraw = unwrap(
    await supabase
      .from("draws")
      .insert({
        month_key: normalizeMonthKey(input.monthKey),
        label: formatMonthLabel(input.monthKey),
        mode: input.mode,
        status: input.status,
        created_by_user_id: input.adminId,
        participant_count: input.participantCount,
        jackpot_rollover_in_cents: toCents(input.jackpotRolloverIn),
        jackpot_rollover_out_cents: toCents(input.jackpotRolloverOut),
        prize_pool_tier3_cents: toCents(input.prizePool.tier3),
        prize_pool_tier4_cents: toCents(input.prizePool.tier4),
        prize_pool_tier5_cents: toCents(input.prizePool.tier5),
        prize_pool_total_cents: toCents(input.prizePool.total),
        simulated_at: input.simulatedAt ?? null,
        published_at: input.publishedAt ?? null,
        notes: input.notes ?? null,
      })
      .select("*")
      .single(),
  );

  const drawId = String((insertedDraw as Record<string, unknown>).id);
  unwrap(
    await supabase.from("draw_numbers").insert(
      input.numbers.map((number, index) => ({
        draw_id: drawId,
        position: index + 1,
        stableford_score: number,
      })),
    ),
  );

  const [draw] = await hydrateDrawRows([insertedDraw as Record<string, unknown>]);
  return draw;
}

async function persistProofAsset(claimId: string, proofImageUrl: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase || isExternalUrl(proofImageUrl)) {
    return proofImageUrl;
  }

  const match = proofImageUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    return proofImageUrl;
  }

  const mimeType = match[1];
  const base64 = match[2];
  const extension = mimeType.split("/")[1]?.replace("jpeg", "jpg") || "png";
  const filePath = `${claimId}/${Date.now()}.${extension}`;
  const bytes = Buffer.from(base64, "base64");

  unwrap(
    await supabase.storage.from(proofBucket).upload(filePath, bytes, {
      contentType: mimeType,
      upsert: true,
    }),
  );

  return filePath;
}

export const appStore = {
  async getUsers() {
    const snapshot = await this.getAdminSnapshot();
    return snapshot.users;
  },
  async getCharities() {
    return getSupabaseCharities();
  },
  async getFeaturedCharities() {
    const charities = await getSupabaseCharities();
    return charities.filter((charity) => charity.spotlight);
  },
  async getCharityBySlug(slug: string) {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return demoStore.getCharityBySlug(slug);
    }

    const row = unwrap(
      await supabase.from("charities").select("*").eq("slug", slug).maybeSingle(),
    );

    return row ? mapCharity(row as Record<string, unknown>) : null;
  },
  async getCharityEvents(charityId?: string) {
    return getSupabaseCharityEvents(charityId);
  },
  async getUserById(userId: string) {
    return getSupabaseUserById(userId);
  },
  async getUserByEmail(email: string) {
    return getSupabaseUserByEmail(email);
  },
  async authenticate(email: string, password: string) {
    const user = await getSupabaseUserByEmail(email);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return null;
    }

    return user;
  },
  async createUser(input: {
    fullName: string;
    email: string;
    password: string;
    charityId: string;
    charityContributionPercent: number;
    plan: PlanInterval;
    country?: string;
  }) {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return demoStore.createUser(input);
    }

    const existing = await getSupabaseUserByEmail(input.email);
    if (existing) {
      throw new Error("An account with that email already exists.");
    }

    if (input.charityContributionPercent < MIN_CHARITY_PERCENT) {
      throw new Error("Please choose a valid charity and contribution amount.");
    }

    const charity = unwrap(
      await supabase
        .from("charities")
        .select("id")
        .eq("id", input.charityId)
        .maybeSingle(),
    );
    if (!charity) {
      throw new Error("Please choose a valid charity and contribution amount.");
    }

    const createdAt = nowIso();
    const userRow = unwrap(
      await supabase
        .from("app_users")
        .insert({
          email: input.email.toLowerCase(),
          password_hash: hashPassword(input.password),
          full_name: input.fullName,
          role: "subscriber",
          country: input.country ?? "United States",
          selected_charity_id: input.charityId,
          charity_contribution_percent: input.charityContributionPercent,
          avatar_url:
            "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=200&q=80",
          created_at: createdAt,
        })
        .select("*")
        .single(),
    );

    const user = mapUser(userRow as Record<string, unknown>);
    const amount = planAmount(input.plan);
    const renewsAt =
      input.plan === "yearly"
        ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString()
        : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();

    const subscriptionRow = unwrap(
      await supabase
        .from("subscriptions")
        .insert({
          user_id: user.id,
          plan: input.plan,
          status: "active",
          amount_cents: toCents(amount),
          currency_code: DEFAULT_CURRENCY,
          started_at: createdAt,
          renews_at: renewsAt,
        })
        .select("*")
        .single(),
    );

    unwrap(
      await supabase.from("payments").insert({
        user_id: user.id,
        charity_id: user.selectedCharityId,
        subscription_id: String((subscriptionRow as Record<string, unknown>).id),
        kind: "subscription",
        status: "succeeded",
        amount_cents: toCents(amount),
        charity_amount_cents: toCents(
          amount * (user.charityContributionPercent / 100),
        ),
        currency_code: DEFAULT_CURRENCY,
        description: `${input.plan} membership`,
        created_at: createdAt,
      }),
    );

    return user;
  },
  async getUserSubscription(userId: string) {
    return getSupabaseUserSubscription(userId);
  },
  async getLatestScores(userId: string) {
    return getSupabaseLatestScores(userId);
  },
  async saveScore(userId: string, value: number, playedAt: string) {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return demoStore.saveScore(userId, value, playedAt);
    }

    const normalizedDate = new Date(playedAt).toISOString().slice(0, 10);
    const duplicate = unwrap(
      await supabase
        .from("scores")
        .select("id")
        .eq("user_id", userId)
        .eq("played_at", normalizedDate)
        .maybeSingle(),
    );

    if (duplicate) {
      throw new Error("A score already exists for that date. Edit or delete it instead.");
    }

    const row = unwrap(
      await supabase
        .from("scores")
        .insert({
          user_id: userId,
          stableford_score: value,
          played_at: normalizedDate,
        })
        .select("*")
        .single(),
    );

    return mapScore(row as Record<string, unknown>);
  },
  async updateScore(userId: string, scoreId: string, value: number, playedAt: string) {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return demoStore.updateScore(userId, scoreId, value, playedAt);
    }

    const normalizedDate = new Date(playedAt).toISOString().slice(0, 10);
    const duplicate = unwrap(
      await supabase
        .from("scores")
        .select("id")
        .eq("user_id", userId)
        .eq("played_at", normalizedDate)
        .neq("id", scoreId)
        .maybeSingle(),
    );

    if (duplicate) {
      throw new Error("Only one score is allowed per date.");
    }

    const row = unwrap(
      await supabase
        .from("scores")
        .update({
          stableford_score: value,
          played_at: normalizedDate,
        })
        .eq("id", scoreId)
        .eq("user_id", userId)
        .select("*")
        .maybeSingle(),
    );

    if (!row) {
      throw new Error("Score not found.");
    }

    return mapScore(row as Record<string, unknown>);
  },
  async deleteScore(userId: string, scoreId: string) {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return demoStore.deleteScore(userId, scoreId);
    }

    const row = unwrap(
      await supabase
        .from("scores")
        .delete()
        .eq("id", scoreId)
        .eq("user_id", userId)
        .select("id")
        .maybeSingle(),
    );

    return Boolean(row);
  },
  async updateCharityPreference(
    userId: string,
    charityId: string,
    charityContributionPercent: number,
  ) {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return demoStore.updateCharityPreference(
        userId,
        charityId,
        charityContributionPercent,
      );
    }

    const row = unwrap(
      await supabase
        .from("app_users")
        .update({
          selected_charity_id: charityId,
          charity_contribution_percent: charityContributionPercent,
        })
        .eq("id", userId)
        .select("*")
        .maybeSingle(),
    );

    if (!row) {
      throw new Error("User not found.");
    }

    return mapUser(row as Record<string, unknown>);
  },
  async finalizeSubscriptionCheckout(input: {
    userId: string;
    plan: PlanInterval;
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
    stripeReference?: string | null;
    paidAt?: string;
  }) {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      const checkout = demoStore.createCheckout(input.userId, input.plan);
      return checkout.subscription;
    }

    if (input.stripeReference) {
      const existingPaymentRows = unwrap(
        await supabase
          .from("payments")
          .select("id")
          .eq("stripe_reference", input.stripeReference)
          .eq("kind", "subscription"),
      );

      if ((existingPaymentRows as unknown[]).length > 0) {
        return this.getUserSubscription(input.userId);
      }
    }

    const user = await this.getUserById(input.userId);
    if (!user) {
      throw new Error("User not found.");
    }

    const amount = planAmount(input.plan);
    const paidAt = input.paidAt ?? nowIso();
    const renewsAt =
      input.plan === "yearly"
        ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString()
        : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
    const existingSubscription = await this.getUserSubscription(input.userId);

    let subscriptionRow: Record<string, unknown> | null = null;

    if (existingSubscription) {
      subscriptionRow = unwrap(
        await supabase
          .from("subscriptions")
          .update({
            plan: input.plan,
            status: "active",
            amount_cents: toCents(amount),
            started_at: paidAt,
            renews_at: renewsAt,
            stripe_customer_id: input.stripeCustomerId ?? existingSubscription.stripeCustomerId,
            stripe_subscription_id:
              input.stripeSubscriptionId ?? existingSubscription.stripeSubscriptionId,
          })
          .eq("id", existingSubscription.id)
          .select("*")
          .single(),
      ) as Record<string, unknown>;
    } else {
      subscriptionRow = unwrap(
        await supabase
          .from("subscriptions")
          .insert({
            user_id: input.userId,
            plan: input.plan,
            status: "active",
            amount_cents: toCents(amount),
            currency_code: DEFAULT_CURRENCY,
            started_at: paidAt,
            renews_at: renewsAt,
            stripe_customer_id: input.stripeCustomerId ?? null,
            stripe_subscription_id: input.stripeSubscriptionId ?? null,
          })
          .select("*")
          .single(),
      ) as Record<string, unknown>;
    }

    unwrap(
      await supabase.from("payments").insert({
        user_id: input.userId,
        subscription_id: String(subscriptionRow.id),
        charity_id: user.selectedCharityId,
        kind: "subscription",
        status: "succeeded",
        amount_cents: toCents(amount),
        charity_amount_cents: toCents(
          amount * (user.charityContributionPercent / 100),
        ),
        currency_code: DEFAULT_CURRENCY,
        stripe_reference: input.stripeReference ?? null,
        description: `Checkout for ${input.plan} plan`,
        created_at: paidAt,
      }),
    );

    return mapSubscription(subscriptionRow);
  },
  async createCheckout(userId: string, plan: PlanInterval) {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error("Subscription could not be created.");
    }

    const stripe = getStripe();
    const priceId =
      plan === "yearly" ? env.stripeYearlyPriceId : env.stripeMonthlyPriceId;

    if (stripe && priceId) {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${env.appUrl}/dashboard/subscription?checkout=success`,
        cancel_url: `${env.appUrl}/dashboard/subscription?checkout=cancelled`,
        customer_email: user.email,
        client_reference_id: user.id,
        metadata: {
          type: "subscription",
          userId: user.id,
          plan,
        },
      });

      return {
        sessionUrl: session.url ?? "/dashboard/subscription",
        subscription: await this.getUserSubscription(userId),
      };
    }

    const subscription = await this.finalizeSubscriptionCheckout({ userId, plan });
    return {
      sessionUrl: `/dashboard/subscription?checkout=success&plan=${plan}`,
      subscription,
    };
  },
  async finalizeDonationCheckout(input: {
    userId: string | null;
    charityId: string;
    amount: number;
    stripeReference?: string | null;
    paidAt?: string;
  }) {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return demoStore.createDonation(input.userId, input.charityId, input.amount);
    }

    if (input.stripeReference) {
      const existingPaymentRows = unwrap(
        await supabase
          .from("payments")
          .select("id")
          .eq("stripe_reference", input.stripeReference)
          .eq("kind", "charity"),
      );

      if ((existingPaymentRows as unknown[]).length > 0) {
        const row = unwrap(
          await supabase
            .from("payments")
            .select("*")
            .eq("stripe_reference", input.stripeReference)
            .eq("kind", "charity")
            .limit(1)
            .single(),
        );

        return mapPayment(row as Record<string, unknown>);
      }
    }

    const row = unwrap(
      await supabase
        .from("payments")
        .insert({
          user_id: input.userId,
          charity_id: input.charityId,
          kind: "charity",
          status: "succeeded",
          amount_cents: toCents(input.amount),
          charity_amount_cents: toCents(input.amount),
          currency_code: DEFAULT_CURRENCY,
          stripe_reference: input.stripeReference ?? null,
          description: "Independent charity donation",
          created_at: input.paidAt ?? nowIso(),
        })
        .select("*")
        .single(),
    );

    return mapPayment(row as Record<string, unknown>);
  },
  async createDonation(userId: string | null, charityId: string, amount: number) {
    const stripe = getStripe();

    if (stripe) {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        success_url: `${env.appUrl}/charities?donation=success`,
        cancel_url: `${env.appUrl}/charities?donation=cancelled`,
        client_reference_id: userId ?? undefined,
        metadata: {
          type: "charity",
          charityId,
          amount: String(amount),
          userId: userId ?? "",
        },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: DEFAULT_CURRENCY.toLowerCase(),
              unit_amount: toCents(amount),
              product_data: {
                name: "Charity donation",
              },
            },
          },
        ],
      });

      return {
        sessionUrl: session.url ?? `${env.appUrl}/charities`,
      };
    }

    const payment = await this.finalizeDonationCheckout({
      userId,
      charityId,
      amount,
    });

    return { payment };
  },
  async createCharity(input: Omit<CharityRecord, "id">) {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return demoStore.createCharity(input);
    }

    const row = unwrap(
      await supabase
        .from("charities")
        .insert({
          slug: input.slug,
          name: input.name,
          category: input.category,
          country: input.country,
          description: input.description,
          mission: input.mission,
          image_url: input.imageUrl,
          spotlight: input.spotlight,
          impact_blurb: input.impactBlurb,
          tags: input.tags,
          website_url: input.websiteUrl,
        })
        .select("*")
        .single(),
    );

    return mapCharity(row as Record<string, unknown>);
  },
  async updateCharity(charityId: string, input: Omit<CharityRecord, "id">) {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return demoStore.updateCharity(charityId, input);
    }

    const row = unwrap(
      await supabase
        .from("charities")
        .update({
          slug: input.slug,
          name: input.name,
          category: input.category,
          country: input.country,
          description: input.description,
          mission: input.mission,
          image_url: input.imageUrl,
          spotlight: input.spotlight,
          impact_blurb: input.impactBlurb,
          tags: input.tags,
          website_url: input.websiteUrl,
        })
        .eq("id", charityId)
        .select("*")
        .maybeSingle(),
    );

    if (!row) {
      throw new Error("Charity not found.");
    }

    return mapCharity(row as Record<string, unknown>);
  },
  async deleteCharity(charityId: string) {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return demoStore.deleteCharity(charityId);
    }

    const userRows = unwrap(
      await supabase.from("app_users").select("id").eq("selected_charity_id", charityId),
    );
    if ((userRows as unknown[]).length > 0) {
      throw new Error(
        "This charity is still selected by one or more users and cannot be deleted.",
      );
    }

    unwrap(await supabase.from("charities").delete().eq("id", charityId));
  },
  async updateSubscriptionStatus(
    subscriptionId: string,
    status: SubscriptionRecord["status"],
    plan?: PlanInterval,
  ) {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return demoStore.updateSubscriptionStatus(subscriptionId, status, plan);
    }

    const updates: Record<string, unknown> = { status };
    if (plan) {
      updates.plan = plan;
      updates.amount_cents = toCents(planAmount(plan));
    }

    const row = unwrap(
      await supabase
        .from("subscriptions")
        .update(updates)
        .eq("id", subscriptionId)
        .select("*")
        .maybeSingle(),
    );

    if (!row) {
      throw new Error("Subscription not found.");
    }

    return mapSubscription(row as Record<string, unknown>);
  },
  async getDashboardSnapshot(userId: string) {
    return getSupabaseDashboardSnapshot(userId);
  },
  async getAdminSnapshot() {
    return getSupabaseAdminSnapshot();
  },
  async getMonthlyRecurringRevenue() {
    return getMonthlyRecurringRevenueValue();
  },
  async getCurrentJackpotRollover() {
    return getLatestPublishedRollover();
  },
  async simulateDraw(adminId: string, monthKey: string, mode: DrawMode) {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return demoStore.simulateDraw(adminId, monthKey, mode);
    }

    const entrants = await getActiveEntrants();
    const monthlyRecurringRevenue = await getMonthlyRecurringRevenueValue();
    const rolloverIn = await getLatestPublishedRollover();
    const result = runDrawEngine({
      entrants,
      mode,
      monthlyRecurringRevenue,
      rolloverIn,
    });

    const draw = await createDrawRecord({
      adminId,
      monthKey,
      mode,
      status: "simulated",
      participantCount: entrants.length,
      prizePool: result.prizePool,
      jackpotRolloverIn: rolloverIn,
      jackpotRolloverOut: result.jackpotRolloverOut,
      simulatedAt: nowIso(),
      notes:
        mode === "weighted"
          ? "Weighted draw blends common score frequency with a controlled long-tail boost."
          : "Random draw uses a standard lottery-style 5-number selection.",
      numbers: result.numbers,
    });

    return {
      draw,
      tierWinners: result.tierWinners,
    };
  },
  async publishDraw(adminId: string, monthKey: string, mode: DrawMode) {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return demoStore.publishDraw(adminId, monthKey, mode);
    }

    const simulationRows = unwrap(
      await supabase
        .from("draws")
        .select("*")
        .eq("month_key", normalizeMonthKey(monthKey))
        .eq("mode", mode)
        .eq("status", "simulated")
        .order("simulated_at", { ascending: false })
        .limit(1),
    );

    let drawRow = (simulationRows as Record<string, unknown>[])[0] ?? null;
    let draw: DrawRecord;

    if (!drawRow) {
      draw = (await this.simulateDraw(adminId, monthKey, mode)).draw;
      const rows = unwrap(
        await supabase.from("draws").select("*").eq("id", draw.id).limit(1),
      );
      drawRow = (rows as Record<string, unknown>[])[0] ?? null;
    } else {
      const [hydrated] = await hydrateDrawRows([drawRow]);
      draw = hydrated;
    }

    if (!drawRow) {
      throw new Error("Unable to load draw.");
    }

    const entrants = await getActiveEntrants();
    const participantUserIds = entrants.map((entrant) => entrant.userId);
    const tierBuckets: Record<MatchTier, string[]> = { 3: [], 4: [], 5: [] };

    entrants.forEach((entrant) => {
      const matches = getMatchCount(entrant.scores, draw.numbers);
      if (matches >= 5) tierBuckets[5].push(entrant.userId);
      else if (matches === 4) tierBuckets[4].push(entrant.userId);
      else if (matches === 3) tierBuckets[3].push(entrant.userId);
    });

    unwrap(await supabase.from("winner_claims").delete().eq("draw_id", draw.id));
    unwrap(await supabase.from("draw_entries").delete().eq("draw_id", draw.id));

    if (participantUserIds.length) {
      const entryRows = unwrap(
        await supabase
          .from("draw_entries")
          .insert(
            participantUserIds.map((userId) => ({
              draw_id: draw.id,
              user_id: userId,
            })),
          )
          .select("*"),
      );

      const scoreRows = unwrap(
        await supabase
          .from("scores")
          .select("*")
          .in("user_id", participantUserIds)
          .order("played_at", { ascending: false })
          .order("created_at", { ascending: false }),
      );

      const latestScoresByUserId = new Map<string, number[]>();
      for (const row of scoreRows as Record<string, unknown>[]) {
        const userId = String(row.user_id);
        const current = latestScoresByUserId.get(userId) ?? [];
        if (current.length < 5) {
          current.push(Number(row.stableford_score));
        }
        latestScoresByUserId.set(userId, current);
      }

      const entryNumberRows: Array<Record<string, unknown>> = [];
      for (const entryRow of entryRows as Record<string, unknown>[]) {
        const entryId = String(entryRow.id);
        const userId = String(entryRow.user_id);
        (latestScoresByUserId.get(userId) ?? []).forEach((score, index) => {
          entryNumberRows.push({
            entry_id: entryId,
            position: index + 1,
            stableford_score: score,
          });
        });
      }

      if (entryNumberRows.length) {
        unwrap(await supabase.from("draw_entry_numbers").insert(entryNumberRows));
      }
    }

    const winnerRows: Array<Record<string, unknown>> = [];
    ([3, 4, 5] as MatchTier[]).forEach((tier) => {
      const winners = tierBuckets[tier];
      if (!winners.length) {
        return;
      }

      const poolShare =
        tier === 5
          ? draw.prizePool.tier5
          : tier === 4
            ? draw.prizePool.tier4
            : draw.prizePool.tier3;
      const amount = poolShare / winners.length;

      winners.forEach((userId) => {
        winnerRows.push({
          draw_id: draw.id,
          user_id: userId,
          match_tier: tier,
          amount_cents: toCents(amount),
          verification_status: "not_submitted",
          payout_status: "pending",
          notes: "Awaiting winner proof upload.",
        });
      });
    });

    if (winnerRows.length) {
      const insertedClaims = unwrap(
        await supabase.from("winner_claims").insert(winnerRows).select("*"),
      );

      const notificationRows = (insertedClaims as Record<string, unknown>[]).map((claim) => ({
        user_id: String(claim.user_id),
        subject: "New draw result",
        body: `You matched Tier ${String(claim.match_tier)} in ${draw.label}. Upload proof to complete verification.`,
      }));

      if (notificationRows.length) {
        unwrap(await supabase.from("notifications").insert(notificationRows));
      }
    }

    const updatedRow = unwrap(
      await supabase
        .from("draws")
        .update({
          status: "published",
          created_by_user_id: adminId,
          participant_count: participantUserIds.length,
          published_at: nowIso(),
        })
        .eq("id", draw.id)
        .select("*")
        .single(),
    );

    const [publishedDraw] = await hydrateDrawRows([updatedRow as Record<string, unknown>]);
    return publishedDraw;
  },
  async submitWinnerProof(userId: string, claimId: string, proofImageUrl: string) {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return demoStore.submitWinnerProof(userId, claimId, proofImageUrl);
    }

    const storedProofUrl = await persistProofAsset(claimId, proofImageUrl);
    const row = unwrap(
      await supabase
        .from("winner_claims")
        .update({
          proof_image_url: storedProofUrl,
          verification_status: "pending",
          submitted_at: nowIso(),
          notes: "Proof submitted and pending review.",
        })
        .eq("id", claimId)
        .eq("user_id", userId)
        .select("*")
        .maybeSingle(),
    );

    if (!row) {
      throw new Error("Winner claim not found.");
    }

    return mapWinnerClaim(row as Record<string, unknown>);
  },
  async reviewWinnerClaim(input: {
    claimId: string;
    adminId: string;
    verificationStatus: Extract<VerificationStatus, "approved" | "rejected">;
    payoutStatus?: "pending" | "paid";
    notes?: string;
  }) {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return demoStore.reviewWinnerClaim(input);
    }

    const claimRow = unwrap(
      await supabase.from("winner_claims").select("*").eq("id", input.claimId).maybeSingle(),
    );

    if (!claimRow) {
      throw new Error("Winner claim not found.");
    }

    const updates: Record<string, unknown> = {
      verification_status: input.verificationStatus,
      reviewed_at: nowIso(),
      reviewed_by_user_id: input.adminId,
      notes: input.notes ?? (claimRow as Record<string, unknown>).notes ?? null,
    };

    if (input.verificationStatus === "approved") {
      updates.payout_status = input.payoutStatus ?? (claimRow as Record<string, unknown>).payout_status;
      if (updates.payout_status === "paid") {
        updates.paid_at = nowIso();
      }
    }

    if (input.verificationStatus === "rejected") {
      updates.payout_status = "pending";
      updates.paid_at = null;
    }

    const updatedRow = unwrap(
      await supabase
        .from("winner_claims")
        .update(updates)
        .eq("id", input.claimId)
        .select("*")
        .single(),
    );

    if (
      input.verificationStatus === "approved" &&
      (updates.payout_status as string) === "paid"
    ) {
      const existingPaymentRows = unwrap(
        await supabase
          .from("payments")
          .select("id")
          .eq("draw_id", String((updatedRow as Record<string, unknown>).draw_id))
          .eq("user_id", String((updatedRow as Record<string, unknown>).user_id))
          .eq("kind", "payout"),
      );

      if ((existingPaymentRows as unknown[]).length === 0) {
        unwrap(
          await supabase.from("payments").insert({
            user_id: String((updatedRow as Record<string, unknown>).user_id),
            draw_id: String((updatedRow as Record<string, unknown>).draw_id),
            kind: "payout",
            status: "succeeded",
            amount_cents: Number((updatedRow as Record<string, unknown>).amount_cents),
            currency_code: DEFAULT_CURRENCY,
            description: `Tier ${String((updatedRow as Record<string, unknown>).match_tier)} winner payout`,
            created_at: nowIso(),
          }),
        );
      }
    }

    const user = await this.getUserById(String((updatedRow as Record<string, unknown>).user_id));
    if (user) {
      const subject =
        input.verificationStatus === "approved"
          ? "Winner claim approved"
          : "Winner claim rejected";
      const body =
        input.verificationStatus === "approved"
          ? `Your claim has been approved${updates.payout_status === "paid" ? " and marked paid." : "."}`
          : "Your claim has been rejected. Please review the admin notes.";

      unwrap(
        await supabase.from("notifications").insert({
          user_id: user.id,
          subject,
          body,
        }),
      );

      await sendNotificationEmail({
        to: user.email,
        subject,
        html: `<p>${body}</p>`,
      });
    }

    return mapWinnerClaim(updatedRow as Record<string, unknown>);
  },
  async updateUserProfile(
    userId: string,
    input: {
      fullName: string;
      email: string;
      country: string;
      role: UserRecord["role"];
      selectedCharityId: string;
      charityContributionPercent: number;
    },
  ) {
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return demoStore.updateUserProfile(userId, input);
    }

    const duplicateRows = unwrap(
      await supabase
        .from("app_users")
        .select("id")
        .ilike("email", input.email)
        .neq("id", userId),
    );

    if ((duplicateRows as unknown[]).length > 0) {
      throw new Error("An account with that email already exists.");
    }

    const row = unwrap(
      await supabase
        .from("app_users")
        .update({
          full_name: input.fullName,
          email: input.email.toLowerCase(),
          country: input.country,
          role: input.role,
          selected_charity_id: input.selectedCharityId,
          charity_contribution_percent: input.charityContributionPercent,
        })
        .eq("id", userId)
        .select("*")
        .maybeSingle(),
    );

    if (!row) {
      throw new Error("User not found.");
    }

    return mapUser(row as Record<string, unknown>);
  },
};
