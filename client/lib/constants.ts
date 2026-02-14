export const SITE = {
  name: "HOW MUCH",
  tagline: "Know the Real Price. Anywhere in Nigeria.",
  description:
    "Nigeria's grocery intelligence engine. Compare prices, track trends, and make informed decisions.",
} as const;

export const LOCATIONS = ["Lagos", "Abuja", "Ibadan", "Port Harcourt", "Kano"] as const;

export const WEIGHT_OPTIONS = {
  rice: ["1kg", "5kg", "10kg", "25kg", "50kg"],
  beans: ["1kg", "5kg", "10kg", "25kg", "50kg"],
  default: ["1kg", "500g", "2kg", "5kg", "10kg"],
} as const;

export const ROLES = {
  customer: "customer",
  vendor: "vendor",
  shopper: "shopper",
  survey: "survey",
  integrator: "integrator",
  admin: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const DASHBOARD_PATHS: Record<Role, string> = {
  customer: "/dashboard",
  vendor: "/vendor",
  shopper: "/shopper",
  survey: "/survey",
  integrator: "/integrator",
  admin: "/admin",
};
