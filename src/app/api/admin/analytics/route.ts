import { NextResponse } from "next/server";
import { getCurrentUser, unauthorized, forbidden } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "ADMIN") return forbidden();

  const [
    totalUsers,
    totalSubscribers,
    activeSubscriptions,
    totalPrizePool,
    totalCharityContributions,
    totalDraws,
    totalWinners,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "SUBSCRIBER" } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.draw.aggregate({ _sum: { prizePool: true } }),
    prisma.donation.aggregate({ _sum: { amount: true } }),
    prisma.draw.count(),
    prisma.winner.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true, role: true },
    }),
  ]);

  return NextResponse.json({
    totalUsers,
    totalSubscribers,
    activeSubscriptions,
    totalPrizePool: totalPrizePool._sum.prizePool || 0,
    totalCharityContributions: totalCharityContributions._sum.amount || 0,
    totalDraws,
    totalWinners,
    recentUsers,
  });
}
