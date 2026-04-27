import {
  DEFAULT_CURRENCY,
  MAX_SCORES_STORED,
  MIN_CHARITY_PERCENT,
  PLAN_DEFINITIONS,
} from "@/lib/constants";
import { getMatchCount, runDrawEngine } from "@/lib/draw-engine";
import { formatMonthLabel } from "@/lib/format";
import type {
  AdminSnapshot,
  CharityEventRecord,
  CharityRecord,
  DashboardSnapshot,
  DrawMode,
  DrawRecord,
  MatchTier,
  NotificationRecord,
  PaymentRecord,
  PlanInterval,
  ScoreRecord,
  SubscriptionRecord,
  UserRecord,
  VerificationStatus,
  WinnerClaimRecord,
} from "@/lib/types";
import { hashPassword, verifyPassword } from "@/lib/passwords";

function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

function cloneValue<T>(value: T): T {
  return structuredClone(value);
}

function getPlanAmount(plan: PlanInterval) {
  return PLAN_DEFINITIONS.find((item) => item.id === plan)?.amount ?? 0;
}

function sortScoresDescending(scores: ScoreRecord[]) {
  return [...scores].sort(
    (left, right) =>
      new Date(right.playedAt).getTime() - new Date(left.playedAt).getTime(),
  );
}

function monthlyEquivalent(subscription: SubscriptionRecord) {
  const amount = subscription.amount;
  return subscription.plan === "yearly" ? amount / 12 : amount;
}

function nowIso() {
  return new Date().toISOString();
}

const charityA = "charity_birdsong";
const charityB = "charity_fairway";
const charityC = "charity_watershed";

const seedCharities: CharityRecord[] = [
  {
    id: charityA,
    slug: "birdsong-youth-trust",
    name: "Birdsong Youth Trust",
    category: "Youth development",
    country: "United Kingdom",
    description:
      "Birdsong funds after-school creative labs, mentorship circles, and travel grants for young people in under-resourced communities.",
    mission:
      "Open creative and educational opportunities for young people who have been historically under-served.",
    imageUrl:
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80",
    spotlight: true,
    impactBlurb: "1,420 workshop places funded in the last 12 months.",
    tags: ["Youth", "Education", "Creativity"],
    websiteUrl: "https://example.org/birdsong",
  },
  {
    id: charityB,
    slug: "fairway-food-network",
    name: "Fairway Food Network",
    category: "Food security",
    country: "United States",
    description:
      "A distributed food network connecting golfers, clubs, and local kitchens to families facing food insecurity.",
    mission:
      "Turn recurring sports communities into reliable channels for practical food support.",
    imageUrl:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80",
    spotlight: false,
    impactBlurb: "86,000 meals distributed this quarter.",
    tags: ["Community", "Meals", "Families"],
    websiteUrl: "https://example.org/fairway-food",
  },
  {
    id: charityC,
    slug: "watershed-mental-health-fund",
    name: "Watershed Mental Health Fund",
    category: "Mental health",
    country: "Australia",
    description:
      "Watershed sponsors trauma-informed counselling, peer support, and crisis transport in rural communities.",
    mission:
      "Make practical, immediate mental-health support reachable beyond major city centres.",
    imageUrl:
      "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?auto=format&fit=crop&w=1200&q=80",
    spotlight: true,
    impactBlurb: "3,200 counselling sessions delivered across regional programs.",
    tags: ["Mental health", "Rural", "Support"],
    websiteUrl: "https://example.org/watershed",
  },
];

const seedCharityEvents: CharityEventRecord[] = [
  {
    id: createId("event"),
    charityId: charityA,
    title: "Summer Skills Day",
    startsAt: "2026-06-21T10:00:00.000Z",
    location: "Leeds",
    summary: "A creative workshop series with local mentors and visiting coaches.",
  },
  {
    id: createId("event"),
    charityId: charityB,
    title: "Nine Holes, Nine Kitchens",
    startsAt: "2026-05-19T13:00:00.000Z",
    location: "Austin",
    summary: "A charity golf day paired with mobile pantry collection points.",
  },
  {
    id: createId("event"),
    charityId: charityC,
    title: "Rural Wellbeing Open",
    startsAt: "2026-07-10T09:00:00.000Z",
    location: "Adelaide Hills",
    summary: "Peer-support activations, screenings, and fundraising on-course.",
  },
];

const demoPassword = hashPassword("DemoPass123!");

const adminUserId = "user_admin";
const mayaUserId = "user_maya";
const noahUserId = "user_noah";
const aishaUserId = "user_aisha";
const liamUserId = "user_liam";

const seedUsers: UserRecord[] = [
  {
    id: adminUserId,
    email: "admin@digitalheroes.dev",
    fullName: "Avery Quinn",
    passwordHash: demoPassword,
    role: "admin",
    country: "United Kingdom",
    selectedCharityId: charityA,
    charityContributionPercent: 15,
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    createdAt: "2026-01-10T10:00:00.000Z",
  },
  {
    id: mayaUserId,
    email: "maya@digitalheroes.dev",
    fullName: "Maya Chen",
    passwordHash: demoPassword,
    role: "subscriber",
    country: "United States",
    selectedCharityId: charityB,
    charityContributionPercent: 20,
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    createdAt: "2026-02-03T08:00:00.000Z",
  },
  {
    id: noahUserId,
    email: "noah@digitalheroes.dev",
    fullName: "Noah Ibrahim",
    passwordHash: demoPassword,
    role: "subscriber",
    country: "United Arab Emirates",
    selectedCharityId: charityC,
    charityContributionPercent: 12,
    avatarUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    createdAt: "2026-02-14T08:00:00.000Z",
  },
  {
    id: aishaUserId,
    email: "aisha@digitalheroes.dev",
    fullName: "Aisha Thompson",
    passwordHash: demoPassword,
    role: "subscriber",
    country: "South Africa",
    selectedCharityId: charityA,
    charityContributionPercent: 18,
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    createdAt: "2026-03-02T08:00:00.000Z",
  },
  {
    id: liamUserId,
    email: "liam@digitalheroes.dev",
    fullName: "Liam O'Connell",
    passwordHash: demoPassword,
    role: "subscriber",
    country: "Ireland",
    selectedCharityId: charityC,
    charityContributionPercent: 10,
    avatarUrl:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=200&q=80",
    createdAt: "2026-03-18T08:00:00.000Z",
  },
];

const seedSubscriptions: SubscriptionRecord[] = [
  {
    id: createId("sub"),
    userId: adminUserId,
    plan: "yearly",
    status: "active",
    amount: 299,
    currency: DEFAULT_CURRENCY,
    startedAt: "2026-01-10T10:00:00.000Z",
    renewsAt: "2027-01-10T10:00:00.000Z",
  },
  {
    id: createId("sub"),
    userId: mayaUserId,
    plan: "yearly",
    status: "active",
    amount: 299,
    currency: DEFAULT_CURRENCY,
    startedAt: "2026-02-03T08:00:00.000Z",
    renewsAt: "2027-02-03T08:00:00.000Z",
  },
  {
    id: createId("sub"),
    userId: noahUserId,
    plan: "monthly",
    status: "renewal_due",
    amount: 29,
    currency: DEFAULT_CURRENCY,
    startedAt: "2026-03-01T08:00:00.000Z",
    renewsAt: "2026-05-01T08:00:00.000Z",
  },
  {
    id: createId("sub"),
    userId: aishaUserId,
    plan: "monthly",
    status: "active",
    amount: 29,
    currency: DEFAULT_CURRENCY,
    startedAt: "2026-04-02T08:00:00.000Z",
    renewsAt: "2026-05-02T08:00:00.000Z",
  },
  {
    id: createId("sub"),
    userId: liamUserId,
    plan: "monthly",
    status: "expired",
    amount: 29,
    currency: DEFAULT_CURRENCY,
    startedAt: "2026-02-18T08:00:00.000Z",
    renewsAt: "2026-03-18T08:00:00.000Z",
    cancelledAt: "2026-03-20T08:00:00.000Z",
  },
];

const seedScoreTuples: Array<[string, number, string]> = [
  ["2026-04-25", 33, mayaUserId],
  ["2026-04-18", 29, mayaUserId],
  ["2026-04-11", 31, mayaUserId],
  ["2026-04-03", 36, mayaUserId],
  ["2026-03-25", 27, mayaUserId],
  ["2026-04-22", 30, noahUserId],
  ["2026-04-14", 35, noahUserId],
  ["2026-04-07", 33, noahUserId],
  ["2026-03-31", 31, noahUserId],
  ["2026-03-24", 29, noahUserId],
  ["2026-04-26", 37, aishaUserId],
  ["2026-04-19", 34, aishaUserId],
  ["2026-04-10", 32, aishaUserId],
  ["2026-04-01", 28, aishaUserId],
  ["2026-03-22", 30, aishaUserId],
  ["2026-04-08", 22, liamUserId],
  ["2026-03-28", 24, liamUserId],
];

const seedScores: ScoreRecord[] = seedScoreTuples.map(([playedAt, value, userId]) => ({
  id: createId("score"),
  userId,
  value,
  playedAt: `${playedAt}T00:00:00.000Z`,
  createdAt: `${playedAt}T12:00:00.000Z`,
  updatedAt: `${playedAt}T12:00:00.000Z`,
}));

const seedDraws: DrawRecord[] = [
  {
    id: createId("draw"),
    monthKey: "2026-02",
    label: formatMonthLabel("2026-02"),
    mode: "random",
    status: "published",
    numbers: [21, 27, 31, 35, 39],
    createdByUserId: adminUserId,
    participantUserIds: [adminUserId, mayaUserId, noahUserId],
    prizePool: { tier3: 58, tier4: 81, tier5: 92, total: 231 },
    jackpotRolloverIn: 0,
    jackpotRolloverOut: 92,
    publishedAt: "2026-02-28T12:00:00.000Z",
  },
  {
    id: createId("draw"),
    monthKey: "2026-03",
    label: formatMonthLabel("2026-03"),
    mode: "weighted",
    status: "published",
    numbers: [27, 29, 31, 33, 35],
    createdByUserId: adminUserId,
    participantUserIds: [adminUserId, mayaUserId, noahUserId, aishaUserId],
    prizePool: { tier3: 67, tier4: 94, tier5: 200, total: 361 },
    jackpotRolloverIn: 92,
    jackpotRolloverOut: 0,
    publishedAt: "2026-03-31T12:00:00.000Z",
  },
];

const seedWinners: WinnerClaimRecord[] = [
  {
    id: createId("claim"),
    drawId: seedDraws[0].id,
    userId: mayaUserId,
    matchTier: 3,
    amount: 58,
    verificationStatus: "approved",
    payoutStatus: "paid",
    proofImageUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    submittedAt: "2026-03-01T10:00:00.000Z",
    reviewedAt: "2026-03-02T10:00:00.000Z",
    reviewedByUserId: adminUserId,
    paidAt: "2026-03-05T10:00:00.000Z",
  },
  {
    id: createId("claim"),
    drawId: seedDraws[1].id,
    userId: mayaUserId,
    matchTier: 5,
    amount: 200,
    verificationStatus: "approved",
    payoutStatus: "paid",
    proofImageUrl:
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80",
    submittedAt: "2026-04-01T10:00:00.000Z",
    reviewedAt: "2026-04-02T10:00:00.000Z",
    reviewedByUserId: adminUserId,
    paidAt: "2026-04-04T10:00:00.000Z",
  },
  {
    id: createId("claim"),
    drawId: seedDraws[1].id,
    userId: noahUserId,
    matchTier: 4,
    amount: 94,
    verificationStatus: "pending",
    payoutStatus: "pending",
    proofImageUrl:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80",
    submittedAt: "2026-04-01T11:00:00.000Z",
  },
];

const seedPayments: PaymentRecord[] = [
  ...seedSubscriptions.map((subscription) => {
    const user = seedUsers.find((item) => item.id === subscription.userId)!;
    return {
      id: createId("pay"),
      userId: subscription.userId,
      subscriptionId: subscription.id,
      charityId: user.selectedCharityId,
      kind: "subscription" as const,
      status: "succeeded" as const,
      amount: subscription.amount,
      charityAmount:
        subscription.amount * (user.charityContributionPercent / 100),
      currency: subscription.currency,
      description: `${subscription.plan} membership`,
      createdAt: subscription.startedAt,
    };
  }),
  {
    id: createId("pay"),
    userId: mayaUserId,
    charityId: charityB,
    kind: "charity",
    status: "succeeded",
    amount: 75,
    charityAmount: 75,
    currency: DEFAULT_CURRENCY,
    description: "Independent charity donation",
    createdAt: "2026-04-08T10:00:00.000Z",
  },
  {
    id: createId("pay"),
    userId: mayaUserId,
    drawId: seedDraws[1].id,
    kind: "payout",
    status: "succeeded",
    amount: 200,
    currency: DEFAULT_CURRENCY,
    description: "March jackpot payout",
    createdAt: "2026-04-04T10:00:00.000Z",
  },
];

const seedNotifications: NotificationRecord[] = [
  {
    id: createId("note"),
    userId: mayaUserId,
    subject: "Jackpot approved",
    body: "Your March 2026 5-match claim has been approved and paid.",
    createdAt: "2026-04-04T10:30:00.000Z",
  },
  {
    id: createId("note"),
    userId: noahUserId,
    subject: "Proof received",
    body: "Your 4-match proof is pending admin review.",
    createdAt: "2026-04-01T11:30:00.000Z",
  },
];

type DemoState = {
  charities: CharityRecord[];
  charityEvents: CharityEventRecord[];
  users: UserRecord[];
  subscriptions: SubscriptionRecord[];
  scores: ScoreRecord[];
  draws: DrawRecord[];
  winners: WinnerClaimRecord[];
  payments: PaymentRecord[];
  notifications: NotificationRecord[];
};

const state: DemoState = {
  charities: cloneValue(seedCharities),
  charityEvents: cloneValue(seedCharityEvents),
  users: cloneValue(seedUsers),
  subscriptions: cloneValue(seedSubscriptions),
  scores: cloneValue(seedScores),
  draws: cloneValue(seedDraws),
  winners: cloneValue(seedWinners),
  payments: cloneValue(seedPayments),
  notifications: cloneValue(seedNotifications),
};

export const demoStore = {
  getUsers() {
    return cloneValue(state.users);
  },
  getCharities() {
    return cloneValue(state.charities);
  },
  getFeaturedCharities() {
    return cloneValue(state.charities.filter((charity) => charity.spotlight));
  },
  getCharityBySlug(slug: string) {
    const charity = state.charities.find((item) => item.slug === slug);
    return charity ? cloneValue(charity) : null;
  },
  getCharityEvents(charityId?: string) {
    const events = charityId
      ? state.charityEvents.filter((item) => item.charityId === charityId)
      : state.charityEvents;
    return cloneValue(events);
  },
  getUserById(userId: string) {
    const user = state.users.find((item) => item.id === userId);
    return user ? cloneValue(user) : null;
  },
  getUserByEmail(email: string) {
    const user = state.users.find(
      (item) => item.email.toLowerCase() === email.toLowerCase(),
    );
    return user ? cloneValue(user) : null;
  },
  authenticate(email: string, password: string) {
    const user = state.users.find(
      (item) => item.email.toLowerCase() === email.toLowerCase(),
    );

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return null;
    }

    return cloneValue(user);
  },
  createUser(input: {
    fullName: string;
    email: string;
    password: string;
    charityId: string;
    charityContributionPercent: number;
    plan: PlanInterval;
    country?: string;
  }) {
    if (state.users.some((user) => user.email.toLowerCase() === input.email.toLowerCase())) {
      throw new Error("An account with that email already exists.");
    }

    if (
      !state.charities.some((charity) => charity.id === input.charityId) ||
      input.charityContributionPercent < MIN_CHARITY_PERCENT
    ) {
      throw new Error("Please choose a valid charity and contribution amount.");
    }

    const createdAt = nowIso();
    const user: UserRecord = {
      id: createId("user"),
      email: input.email.toLowerCase(),
      fullName: input.fullName,
      passwordHash: hashPassword(input.password),
      role: "subscriber",
      country: input.country ?? "United States",
      selectedCharityId: input.charityId,
      charityContributionPercent: input.charityContributionPercent,
      avatarUrl:
        "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=200&q=80",
      createdAt,
    };
    const amount = getPlanAmount(input.plan);
    const subscription: SubscriptionRecord = {
      id: createId("sub"),
      userId: user.id,
      plan: input.plan,
      status: "active",
      amount,
      currency: DEFAULT_CURRENCY,
      startedAt: createdAt,
      renewsAt:
        input.plan === "yearly"
          ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString()
          : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    };

    state.users.push(user);
    state.subscriptions.push(subscription);
    state.payments.push({
      id: createId("pay"),
      userId: user.id,
      charityId: user.selectedCharityId,
      subscriptionId: subscription.id,
      kind: "subscription",
      status: "succeeded",
      amount,
      charityAmount: amount * (user.charityContributionPercent / 100),
      currency: DEFAULT_CURRENCY,
      description: `${input.plan} membership`,
      createdAt,
    });

    return cloneValue(user);
  },
  getUserSubscription(userId: string) {
    const subscription = state.subscriptions
      .filter((item) => item.userId === userId)
      .sort(
        (left, right) =>
          new Date(right.renewsAt).getTime() - new Date(left.renewsAt).getTime(),
      )[0];
    return subscription ? cloneValue(subscription) : null;
  },
  getLatestScores(userId: string) {
    return cloneValue(
      sortScoresDescending(state.scores.filter((item) => item.userId === userId)),
    );
  },
  saveScore(userId: string, value: number, playedAt: string) {
    const targetDate = new Date(playedAt).toISOString().slice(0, 10);
    const existing = state.scores.find(
      (score) =>
        score.userId === userId &&
        score.playedAt.slice(0, 10) === targetDate,
    );

    if (existing) {
      throw new Error("A score already exists for that date. Edit or delete it instead.");
    }

    const score: ScoreRecord = {
      id: createId("score"),
      userId,
      value,
      playedAt: new Date(playedAt).toISOString(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    const existingScores = sortScoresDescending(
      state.scores.filter((item) => item.userId === userId),
    );

    if (existingScores.length >= MAX_SCORES_STORED) {
      const oldest = [...existingScores].sort(
        (left, right) =>
          new Date(left.playedAt).getTime() - new Date(right.playedAt).getTime(),
      )[0];
      state.scores = state.scores.filter((item) => item.id !== oldest.id);
    }

    state.scores.push(score);
    return cloneValue(score);
  },
  updateScore(userId: string, scoreId: string, value: number, playedAt: string) {
    const score = state.scores.find(
      (item) => item.id === scoreId && item.userId === userId,
    );

    if (!score) {
      throw new Error("Score not found.");
    }

    const targetDate = new Date(playedAt).toISOString().slice(0, 10);
    const duplicate = state.scores.find(
      (item) =>
        item.userId === userId &&
        item.id !== scoreId &&
        item.playedAt.slice(0, 10) === targetDate,
    );

    if (duplicate) {
      throw new Error("Only one score is allowed per date.");
    }

    score.value = value;
    score.playedAt = new Date(playedAt).toISOString();
    score.updatedAt = nowIso();

    return cloneValue(score);
  },
  deleteScore(userId: string, scoreId: string) {
    const before = state.scores.length;
    state.scores = state.scores.filter(
      (item) => !(item.userId === userId && item.id === scoreId),
    );
    return before !== state.scores.length;
  },
  updateCharityPreference(
    userId: string,
    charityId: string,
    charityContributionPercent: number,
  ) {
    const user = state.users.find((item) => item.id === userId);

    if (!user) {
      throw new Error("User not found.");
    }

    if (!state.charities.some((charity) => charity.id === charityId)) {
      throw new Error("Selected charity could not be found.");
    }

    user.selectedCharityId = charityId;
    user.charityContributionPercent = charityContributionPercent;

    return cloneValue(user);
  },
  updateUserProfile(
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
    const user = state.users.find((item) => item.id === userId);

    if (!user) {
      throw new Error("User not found.");
    }

    const normalizedEmail = input.email.toLowerCase();
    const duplicateEmail = state.users.find(
      (item) => item.id !== userId && item.email.toLowerCase() === normalizedEmail,
    );

    if (duplicateEmail) {
      throw new Error("An account with that email already exists.");
    }

    if (!state.charities.some((charity) => charity.id === input.selectedCharityId)) {
      throw new Error("Selected charity could not be found.");
    }

    if (input.charityContributionPercent < MIN_CHARITY_PERCENT) {
      throw new Error("Charity contribution must meet the minimum percentage.");
    }

    user.fullName = input.fullName;
    user.email = normalizedEmail;
    user.country = input.country;
    user.role = input.role;
    user.selectedCharityId = input.selectedCharityId;
    user.charityContributionPercent = input.charityContributionPercent;

    return cloneValue(user);
  },
  createCheckout(userId: string, plan: PlanInterval) {
    const user = state.users.find((item) => item.id === userId);
    const subscription = state.subscriptions.find((item) => item.userId === userId);

    if (!user || !subscription) {
      throw new Error("Subscription could not be created.");
    }

    subscription.plan = plan;
    subscription.amount = getPlanAmount(plan);
    subscription.status = "active";
    subscription.startedAt = nowIso();
    subscription.renewsAt =
      plan === "yearly"
        ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString()
        : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();

    state.payments.push({
      id: createId("pay"),
      userId,
      charityId: user.selectedCharityId,
      subscriptionId: subscription.id,
      kind: "subscription",
      status: "succeeded",
      amount: subscription.amount,
      charityAmount:
        subscription.amount * (user.charityContributionPercent / 100),
      currency: DEFAULT_CURRENCY,
      description: `Checkout for ${plan} plan`,
      createdAt: nowIso(),
    });

    return {
      sessionUrl: `/dashboard/subscription?checkout=success&plan=${plan}`,
      subscription: cloneValue(subscription),
    };
  },
  createDonation(userId: string | null, charityId: string, amount: number) {
    if (!state.charities.some((charity) => charity.id === charityId)) {
      throw new Error("Charity not found.");
    }

    const payment: PaymentRecord = {
      id: createId("pay"),
      userId,
      charityId,
      kind: "charity",
      status: "succeeded",
      amount,
      charityAmount: amount,
      currency: DEFAULT_CURRENCY,
      description: "Independent charity donation",
      createdAt: nowIso(),
    };

    state.payments.push(payment);
    return cloneValue(payment);
  },
  createCharity(input: Omit<CharityRecord, "id">) {
    if (state.charities.some((charity) => charity.slug === input.slug)) {
      throw new Error("A charity with that slug already exists.");
    }

    const charity: CharityRecord = {
      id: createId("charity"),
      ...input,
    };
    state.charities.push(charity);
    return cloneValue(charity);
  },
  updateCharity(charityId: string, input: Omit<CharityRecord, "id">) {
    const charity = state.charities.find((item) => item.id === charityId);

    if (!charity) {
      throw new Error("Charity not found.");
    }

    const duplicateSlug = state.charities.find(
      (item) => item.id !== charityId && item.slug === input.slug,
    );

    if (duplicateSlug) {
      throw new Error("A charity with that slug already exists.");
    }

    Object.assign(charity, input);
    return cloneValue(charity);
  },
  deleteCharity(charityId: string) {
    if (state.users.some((user) => user.selectedCharityId === charityId)) {
      throw new Error(
        "This charity is still selected by one or more users and cannot be deleted.",
      );
    }

    state.charities = state.charities.filter((item) => item.id !== charityId);
    state.charityEvents = state.charityEvents.filter(
      (event) => event.charityId !== charityId,
    );
  },
  updateSubscriptionStatus(
    subscriptionId: string,
    status: SubscriptionRecord["status"],
    plan?: PlanInterval,
  ) {
    const subscription = state.subscriptions.find((item) => item.id === subscriptionId);

    if (!subscription) {
      throw new Error("Subscription not found.");
    }

    subscription.status = status;
    if (plan) {
      subscription.plan = plan;
      subscription.amount = getPlanAmount(plan);
    }

    return cloneValue(subscription);
  },
  getDashboardSnapshot(userId: string): DashboardSnapshot {
    const user = this.getUserById(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    return {
      user,
      subscription: this.getUserSubscription(userId),
      scores: this.getLatestScores(userId),
      charities: this.getCharities(),
      charityEvents: this.getCharityEvents(),
      draws: cloneValue(
        state.draws.filter(
          (draw) =>
            draw.status === "published" && draw.participantUserIds.includes(userId),
        ),
      ),
      winners: cloneValue(state.winners.filter((winner) => winner.userId === userId)),
      payments: cloneValue(state.payments.filter((payment) => payment.userId === userId)),
      notifications: cloneValue(
        state.notifications.filter((item) => item.userId === userId),
      ),
    };
  },
  getAdminSnapshot(): AdminSnapshot {
    return {
      users: this.getUsers(),
      subscriptions: cloneValue(state.subscriptions),
      scores: cloneValue(state.scores),
      draws: cloneValue(state.draws),
      winners: cloneValue(state.winners),
      charities: this.getCharities(),
      charityEvents: this.getCharityEvents(),
      payments: cloneValue(state.payments),
    };
  },
  getMonthlyRecurringRevenue() {
    return state.subscriptions
      .filter((subscription) =>
        ["active", "renewal_due"].includes(subscription.status),
      )
      .reduce((sum, subscription) => sum + monthlyEquivalent(subscription), 0);
  },
  getCurrentJackpotRollover() {
    const latestPublished = [...state.draws]
      .filter((draw) => draw.status === "published")
      .sort(
        (left, right) =>
          new Date(right.publishedAt ?? 0).getTime() -
          new Date(left.publishedAt ?? 0).getTime(),
      )[0];

    return latestPublished?.jackpotRolloverOut ?? 0;
  },
  simulateDraw(adminId: string, monthKey: string, mode: DrawMode) {
    const participantUserIds = state.subscriptions
      .filter((subscription) =>
        ["active", "renewal_due"].includes(subscription.status),
      )
      .map((subscription) => subscription.userId);
    const entrants = participantUserIds.map((userId) => ({
      userId,
      scores: this.getLatestScores(userId).map((score) => score.value),
    }));
    const result = runDrawEngine({
      entrants,
      mode,
      monthlyRecurringRevenue: this.getMonthlyRecurringRevenue(),
      rolloverIn: this.getCurrentJackpotRollover(),
    });
    const draw: DrawRecord = {
      id: createId("draw"),
      monthKey,
      label: formatMonthLabel(monthKey),
      mode,
      status: "simulated",
      numbers: result.numbers,
      createdByUserId: adminId,
      participantUserIds,
      prizePool: result.prizePool,
      jackpotRolloverIn: this.getCurrentJackpotRollover(),
      jackpotRolloverOut: result.jackpotRolloverOut,
      simulatedAt: nowIso(),
      notes:
        mode === "weighted"
          ? "Weighted draw blends common score frequency with a controlled long-tail boost."
          : "Random draw uses a standard lottery-style 5-number selection.",
    };

    state.draws.push(draw);

    return {
      draw: cloneValue(draw),
      tierWinners: cloneValue(result.tierWinners),
    };
  },
  publishDraw(adminId: string, monthKey: string, mode: DrawMode) {
    const existingSimulation = [...state.draws]
      .reverse()
      .find(
        (draw) =>
          draw.monthKey === monthKey &&
          draw.mode === mode &&
          draw.status === "simulated",
      );
    const simulation = existingSimulation ?? this.simulateDraw(adminId, monthKey, mode).draw;
    const draw = state.draws.find((item) => item.id === simulation.id)!;
    const participantUserIds = draw.participantUserIds;
    const tierBuckets: Record<MatchTier, string[]> = { 3: [], 4: [], 5: [] };

    participantUserIds.forEach((userId) => {
      const matches = getMatchCount(
        this.getLatestScores(userId).map((score) => score.value),
        draw.numbers,
      );
      if (matches >= 5) tierBuckets[5].push(userId);
      if (matches === 4) tierBuckets[4].push(userId);
      if (matches === 3) tierBuckets[3].push(userId);
    });

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
        state.winners.push({
          id: createId("claim"),
          drawId: draw.id,
          userId,
          matchTier: tier,
          amount,
          verificationStatus: "not_submitted",
          payoutStatus: "pending",
          notes: "Awaiting winner proof upload.",
        });
      });
    });

    draw.status = "published";
    draw.publishedAt = nowIso();
    draw.createdByUserId = adminId;

    return cloneValue(draw);
  },
  submitWinnerProof(userId: string, claimId: string, proofImageUrl: string) {
    const claim = state.winners.find(
      (item) => item.id === claimId && item.userId === userId,
    );

    if (!claim) {
      throw new Error("Winner claim not found.");
    }

    claim.proofImageUrl = proofImageUrl;
    claim.verificationStatus = "pending";
    claim.submittedAt = nowIso();
    claim.notes = "Proof submitted and pending review.";

    return cloneValue(claim);
  },
  reviewWinnerClaim(input: {
    claimId: string;
    adminId: string;
    verificationStatus: Extract<VerificationStatus, "approved" | "rejected">;
    payoutStatus?: "pending" | "paid";
    notes?: string;
  }) {
    const claim = state.winners.find((item) => item.id === input.claimId);

    if (!claim) {
      throw new Error("Winner claim not found.");
    }

    claim.verificationStatus = input.verificationStatus;
    claim.reviewedAt = nowIso();
    claim.reviewedByUserId = input.adminId;
    claim.notes = input.notes ?? claim.notes;

    if (input.verificationStatus === "approved") {
      claim.payoutStatus = input.payoutStatus ?? claim.payoutStatus;
      if (claim.payoutStatus === "paid") {
        claim.paidAt = nowIso();
        state.payments.push({
          id: createId("pay"),
          userId: claim.userId,
          drawId: claim.drawId,
          kind: "payout",
          status: "succeeded",
          amount: claim.amount,
          currency: DEFAULT_CURRENCY,
          description: `Tier ${claim.matchTier} winner payout`,
          createdAt: nowIso(),
        });
      }
    }

    if (input.verificationStatus === "rejected") {
      claim.payoutStatus = "pending";
    }

    return cloneValue(claim);
  },
};
