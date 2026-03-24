export const CATEGORIES = [
  "Home Cleaning",
  "Handyman / Repairs",
  "Landscaping / Lawn Care",
  "Moving",
  "Painting",
  "Plumbing",
  "Electrical",
  "HVAC",
  "Pest Control",
  "Event Planning",
  "Photography",
  "Web Design / Dev",
  "Graphic Design",
  "Social Media / Marketing",
  "Writing / Copywriting",
  "Accounting / Bookkeeping",
  "AI, Agents and Automation",
  "Online / Digital Services",
  "Legal Services",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Request {
  id: string;
  user_id: string;
  category: string;
  title: string;
  description: string;
  location_area: string;
  budget_hint?: string;
  timeline?: string;
  status: "open" | "matched" | "closed" | "expired";
  quote_count: number;
  expires_at: string;
  created_at: string;
}

export interface Vendor {
  id: string;
  business_name: string;
  category: string;
  description?: string;
  contact_email: string;
  contact_phone?: string;
  location_area?: string;
  verified: boolean;
  created_at: string;
}

export interface Quote {
  id: string;
  request_id: string;
  vendor_id: string;
  price_cents: number;
  timeline?: string;
  notes?: string;
  questions?: string;
  status: "pending" | "selected" | "rejected";
  created_at: string;
  vendor?: Vendor;
}

export interface Match {
  id: string;
  request_id: string;
  quote_id: string;
  user_id: string;
  vendor_id: string;
  total_cents: number;
  commission_cents: number;
  stripe_session_id?: string;
  payment_status: "pending" | "paid" | "refunded";
  identity_disclosed_at?: string;
  created_at: string;
}

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(cents / 100);
}

export function commissionCents(totalCents: number) {
  const rate = parseFloat(process.env.COMMISSION_RATE || "0.15");
  return Math.round(totalCents * rate);
}
