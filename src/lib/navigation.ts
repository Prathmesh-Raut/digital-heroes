import {
  Activity,
  Gift,
  HeartHandshake,
  Home,
  LifeBuoy,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

export const siteNavigation = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/charities", label: "Charities" },
];

export const dashboardNavigation = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/scores", label: "Scores", icon: Activity },
  { href: "/dashboard/subscription", label: "Subscription", icon: Sparkles },
  { href: "/dashboard/charity", label: "Charity", icon: HeartHandshake },
  { href: "/dashboard/history", label: "Draws", icon: Trophy },
  { href: "/dashboard/winnings", label: "Winnings", icon: Gift },
];

export const adminNavigation = [
  { href: "/admin", label: "Analytics", icon: ShieldCheck },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: Sparkles },
  { href: "/admin/draws", label: "Draw Control", icon: Trophy },
  { href: "/admin/charities", label: "Charities", icon: HeartHandshake },
  { href: "/admin/winners", label: "Winner Review", icon: LifeBuoy },
];
