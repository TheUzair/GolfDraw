import { NextResponse } from "next/server";
import { getCurrentUser, unauthorized, forbidden } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { winnerVerificationSchema } from "@/lib/validations";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "ADMIN") return forbidden();

  const winners = await prisma.winner.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      draw: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(winners);
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "ADMIN") return forbidden();

  try {
    const body = await req.json();
    const parsed = winnerVerificationSchema.parse(body);

    const winner = await prisma.winner.update({
      where: { id: parsed.winnerId },
      data: {
        status: parsed.status,
        paidAt: parsed.status === "APPROVED" ? undefined : undefined,
      },
    });

    return NextResponse.json(winner);
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}

// Mark as paid
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "ADMIN") return forbidden();

  try {
    const { winnerId } = await req.json();

    const winner = await prisma.winner.update({
      where: { id: winnerId },
      data: {
        status: "PAID",
        paidAt: new Date(),
      },
    });

    return NextResponse.json(winner);
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
