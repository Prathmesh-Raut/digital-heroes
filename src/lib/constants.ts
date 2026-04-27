import type { PlanDefinition } from "@/lib/types";

export const APP_NAME = "Digital Heroes";
export const APP_TAGLINE = "Play with purpose. Win with heart.";
export const APP_DESCRIPTION =
  "A subscription-led golf score platform that powers monthly draws and meaningful charity contributions.";

export const SESSION_COOKIE = "dh_session";
export const MAX_SCORES_STORED = 5;
export const DRAW_NUMBER_COUNT = 5;
export const MIN_CHARITY_PERCENT = 10;
export const DEFAULT_CURRENCY = "USD";

export const PLAN_DEFINITIONS: PlanDefinition[] = [
  {
    id: "monthly",
    name: "Monthly",
    amount: 29,
    currency: DEFAULT_CURRENCY,
    billingLabel: "per month",
    teaser: "Low-friction entry with full access to draws, scores, and charity impact.",
  },
  {
    id: "yearly",
    name: "Yearly",
    amount: 299,
    currency: DEFAULT_CURRENCY,
    billingLabel: "per year",
    teaser: "Best value for committed members, with a discount and stronger prize pool support.",
  },
];

export const PROTECTED_PREFIXES = ["/dashboard", "/admin"];

export const SITE_ROUTES = {
  home: "/",
  pricing: "/pricing",
  charities: "/charities",
  signIn: "/sign-in",
  signUp: "/sign-up",
  dashboard: "/dashboard",
  admin: "/admin",
} as const;
