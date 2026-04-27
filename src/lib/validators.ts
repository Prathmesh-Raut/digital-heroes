import { z } from "zod";

import { MIN_CHARITY_PERCENT } from "@/lib/constants";

export const authSchema = z.object({
  fullName: z.string().min(2).max(80).optional(),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  charityId: z.string().min(1).optional(),
  charityContributionPercent: z
    .number()
    .min(MIN_CHARITY_PERCENT)
    .max(90)
    .optional(),
  plan: z.enum(["monthly", "yearly"]).optional(),
});

export const scoreCreateSchema = z.object({
  playedAt: z.string().min(1),
  value: z.coerce.number().int().min(1).max(45),
});

export const scoreUpdateSchema = scoreCreateSchema.extend({
  id: z.string().min(1),
});

export const charityPreferenceSchema = z.object({
  charityId: z.string().min(1),
  charityContributionPercent: z.coerce.number().min(MIN_CHARITY_PERCENT).max(90),
});

export const checkoutSchema = z.object({
  plan: z.enum(["monthly", "yearly"]),
});

export const donationSchema = z.object({
  charityId: z.string().min(1),
  amount: z.coerce.number().min(5).max(10000),
});

export const drawSimulationSchema = z.object({
  monthKey: z.string().regex(/^\d{4}-\d{2}$/),
  mode: z.enum(["random", "weighted"]),
});

export const charityAdminSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(3),
  name: z.string().min(2),
  category: z.string().min(2),
  country: z.string().min(2),
  description: z.string().min(20),
  mission: z.string().min(20),
  imageUrl: z.string().url(),
  spotlight: z.boolean().default(false),
  impactBlurb: z.string().min(5),
  tags: z.array(z.string()).min(1),
  websiteUrl: z.string().url(),
});

export const subscriptionAdminSchema = z.object({
  status: z.enum(["active", "inactive", "renewal_due", "expired", "cancelled"]),
  plan: z.enum(["monthly", "yearly"]).optional(),
});

export const adminUserUpdateSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email(),
  country: z.string().min(2).max(80),
  role: z.enum(["subscriber", "admin"]),
  selectedCharityId: z.string().min(1),
  charityContributionPercent: z.coerce.number().min(MIN_CHARITY_PERCENT).max(90),
});

export const winnerProofSchema = z.object({
  claimId: z.string().min(1),
  proofImageUrl: z.string().min(20),
});

export const winnerReviewSchema = z.object({
  claimId: z.string().min(1),
  verificationStatus: z.enum(["approved", "rejected"]),
  payoutStatus: z.enum(["pending", "paid"]).optional(),
  notes: z.string().max(400).optional(),
});
