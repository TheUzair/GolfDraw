import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan as "MONTHLY" | "YEARLY";

        if (userId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          await prisma.subscription.upsert({
            where: { userId },
            create: {
              userId,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0].price.id,
              plan: plan || "MONTHLY",
              status: "ACTIVE",
              currentPeriodStart: new Date(
                (subscription as any).current_period_start * 1000
              ),
              currentPeriodEnd: new Date(
                (subscription as any).current_period_end * 1000
              ),
            },
            update: {
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0].price.id,
              plan: plan || "MONTHLY",
              status: "ACTIVE",
              currentPeriodStart: new Date(
                (subscription as any).current_period_start * 1000
              ),
              currentPeriodEnd: new Date(
                (subscription as any).current_period_end * 1000
              ),
            },
          });

          await prisma.user.update({
            where: { id: userId },
            data: { role: "SUBSCRIBER" },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const sub = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (sub) {
          const statusMap: Record<string, string> = {
            active: "ACTIVE",
            canceled: "CANCELLED",
            past_due: "PAST_DUE",
            unpaid: "EXPIRED",
          };

          await prisma.subscription.update({
            where: { stripeSubscriptionId: subscription.id },
            data: {
              status: (statusMap[subscription.status] || "ACTIVE") as "ACTIVE" | "CANCELLED" | "EXPIRED" | "PAST_DUE",
              currentPeriodStart: new Date(
                (subscription as any).current_period_start * 1000
              ),
              currentPeriodEnd: new Date(
                (subscription as any).current_period_end * 1000
              ),
              cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
            },
          });

          if (subscription.status !== "active") {
            await prisma.user.update({
              where: { id: sub.userId },
              data: { role: "USER" },
            });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const sub = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (sub) {
          await prisma.subscription.update({
            where: { stripeSubscriptionId: subscription.id },
            data: { status: "CANCELLED" },
          });

          await prisma.user.update({
            where: { id: sub.userId },
            data: { role: "USER" },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
