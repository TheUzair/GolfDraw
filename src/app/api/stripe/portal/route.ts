import { NextResponse } from "next/server";
import { getCurrentUser, unauthorized } from "@/lib/session";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    if (!user.subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 400 }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.subscription.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
