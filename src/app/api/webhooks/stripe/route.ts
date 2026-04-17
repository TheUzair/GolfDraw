import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendEmail, subscriptionEmail } from "@/lib/email";
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
            session.subscription as string,
            { expand: ["items.data"] }
          );

          // Safely get period dates from subscription or items
          const periodStart =
            (subscription as any).current_period_start ??
            (subscription as any).items?.data?.[0]?.current_period_start;
          const periodEnd =
            (subscription as any).current_period_end ??
            (subscription as any).items?.data?.[0]?.current_period_end;

          await prisma.subscription.upsert({
            where: { userId },
            create: {
              userId,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0]?.price?.id ?? null,
              plan: plan || "MONTHLY",
              status: "ACTIVE",
              currentPeriodStart: periodStart
                ? new Date(periodStart * 1000)
                : new Date(),
              currentPeriodEnd: periodEnd
                ? new Date(periodEnd * 1000)
                : null,
            },
            update: {
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0]?.price?.id ?? null,
              plan: plan || "MONTHLY",
              status: "ACTIVE",
              currentPeriodStart: periodStart
                ? new Date(periodStart * 1000)
                : new Date(),
              currentPeriodEnd: periodEnd
                ? new Date(periodEnd * 1000)
                : null,
            },
          });

          await prisma.user.update({
            where: { id: userId },
            data: { role: "SUBSCRIBER" },
          });

          // Send welcome email
          const dbUser = await prisma.user.findUnique({
            where: { id: userId },
          });
          if (dbUser?.email) {
            const emailContent = subscriptionEmail(
              dbUser.name || "Golfer",
              plan || "MONTHLY"
            );
            await sendEmail({
              to: dbUser.email,
              ...emailContent,
            });
          }
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

          const periodStart =
            (subscription as any).current_period_start ??
            (subscription as any).items?.data?.[0]?.current_period_start;
          const periodEnd =
            (subscription as any).current_period_end ??
            (subscription as any).items?.data?.[0]?.current_period_end;

          await prisma.subscription.update({
            where: { stripeSubscriptionId: subscription.id },
            data: {
              status: (statusMap[subscription.status] || "ACTIVE") as
                | "ACTIVE"
                | "CANCELLED"
                | "EXPIRED"
                | "PAST_DUE",
              currentPeriodStart: periodStart
                ? new Date(periodStart * 1000)
                : undefined,
              currentPeriodEnd: periodEnd
                ? new Date(periodEnd * 1000)
                : undefined,
              cancelAtPeriodEnd: (subscription as any).cancel_at_period_end ?? false,
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
