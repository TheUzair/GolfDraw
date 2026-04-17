import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      typescript: true,
    });
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as any)[prop];
  },
});

export const PLANS = {
  MONTHLY: {
    name: "Monthly",
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
    price: 9.99,
    interval: "month" as const,
  },
  YEARLY: {
    name: "Yearly",
    priceId: process.env.STRIPE_YEARLY_PRICE_ID!,
    price: 99.99,
    interval: "year" as const,
  },
};
