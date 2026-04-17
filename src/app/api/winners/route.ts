import { NextResponse } from "next/server";
import { getCurrentUser, unauthorized } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const winners = await prisma.winner.findMany({
    where: { userId: user.id },
    include: { draw: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(winners);
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const { winnerId, proofUrl } = await req.json();

    const winner = await prisma.winner.findUnique({ where: { id: winnerId } });
    if (!winner || winner.userId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.winner.update({
      where: { id: winnerId },
      data: { proofUrl, status: "PROOF_SUBMITTED" },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
