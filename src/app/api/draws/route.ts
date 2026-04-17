import { NextResponse } from "next/server";
import { getCurrentUser, unauthorized } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const now = new Date();
  const draws = await prisma.draw.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    include: {
      results: true,
      winners: {
        where: { userId: user.id },
      },
      _count: { select: { entries: true } },
    },
  });

  // Current month entry status
  const currentEntry = await prisma.drawEntry.findFirst({
    where: {
      userId: user.id,
      draw: {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    },
  });

  return NextResponse.json({ draws, currentEntry });
}
