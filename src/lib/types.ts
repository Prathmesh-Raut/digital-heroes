export type UserRole = "subscriber" | "admin";
export type PlanInterval = "monthly" | "yearly";
export type SubscriptionStatus =
  | "active"
  | "inactive"
  | "renewal_due"
  | "expired"
  | "cancelled";
export type DrawMode = "random" | "weighted";
export type DrawStatus = "simulated" | "published";
export type MatchTier = 3 | 4 | 5;
export type VerificationStatus =
  | "not_submitted"
  | "pending"
  | "approved"
  | "rejected";
export type PayoutStatus = "pending" | "paid";
export type PaymentKind = "subscription" | "charity" | "payout";
export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

export interface CharityEventRecord {
  id: string;
  charityId: string;
  title: string;
  startsAt: string;
  location: string;
  summary: string;
}

export interface CharityRecord {
  id: string;
  slug: string;
  name: string;
  category: string;
  country: string;
  description: string;
  mission: string;
  imageUrl: string;
  spotlight: boolean;
  impactBlurb: string;
  tags: string[];
  websiteUrl: string;
}

export interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  role: UserRole;
  country: string;
  selectedCharityId: string;
  charityContributionPercent: number;
  avatarUrl: string;
  createdAt: string;
}

export interface SubscriptionRecord {
  id: string;
  userId: string;
  plan: PlanInterval;
  status: SubscriptionStatus;
  amount: number;
  currency: string;
  startedAt: string;
  renewsAt: string;
  cancelledAt?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}

export interface ScoreRecord {
  id: string;
  userId: string;
  value: number;
  playedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrizePoolBreakdown {
  tier3: number;
  tier4: number;
  tier5: number;
  total: number;
}

export interface DrawRecord {
  id: string;
  monthKey: string;
  label: string;
  mode: DrawMode;
  status: DrawStatus;
  numbers: number[];
  createdByUserId: string;
  participantUserIds: string[];
  prizePool: PrizePoolBreakdown;
  jackpotRolloverIn: number;
  jackpotRolloverOut: number;
  simulatedAt?: string | null;
  publishedAt?: string | null;
  notes?: string;
}

export interface WinnerClaimRecord {
  id: string;
  drawId: string;
  userId: string;
  matchTier: MatchTier;
  amount: number;
  verificationStatus: VerificationStatus;
  payoutStatus: PayoutStatus;
  proofImageUrl?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  reviewedByUserId?: string | null;
  paidAt?: string | null;
  notes?: string | null;
}

export interface PaymentRecord {
  id: string;
  userId?: string | null;
  drawId?: string | null;
  charityId?: string | null;
  subscriptionId?: string | null;
  kind: PaymentKind;
  status: PaymentStatus;
  amount: number;
  charityAmount?: number;
  currency: string;
  stripeReference?: string | null;
  description: string;
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  subject: string;
  body: string;
  createdAt: string;
}

export interface SessionPayload {
  userId: string;
  role: UserRole;
  email: string;
}

export interface PlanDefinition {
  id: PlanInterval;
  name: string;
  amount: number;
  currency: string;
  billingLabel: string;
  teaser: string;
}

export interface DrawEntrant {
  userId: string;
  scores: number[];
}

export interface DrawResult {
  numbers: number[];
  prizePool: PrizePoolBreakdown;
  jackpotRolloverOut: number;
  tierWinners: Record<MatchTier, string[]>;
}

export interface DashboardSnapshot {
  user: UserRecord;
  subscription: SubscriptionRecord | null;
  scores: ScoreRecord[];
  charities: CharityRecord[];
  charityEvents: CharityEventRecord[];
  draws: DrawRecord[];
  winners: WinnerClaimRecord[];
  payments: PaymentRecord[];
  notifications: NotificationRecord[];
}

export interface AdminSnapshot {
  users: UserRecord[];
  subscriptions: SubscriptionRecord[];
  scores: ScoreRecord[];
  draws: DrawRecord[];
  winners: WinnerClaimRecord[];
  charities: CharityRecord[];
  charityEvents: CharityEventRecord[];
  payments: PaymentRecord[];
}
