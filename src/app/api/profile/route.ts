import { NextResponse } from "next/server";
import { getCurrentUser, unauthorized } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validations";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      subscription: true,
      charity: true,
      scores: { orderBy: { playedAt: "desc" }, take: 5 },
      winners: { include: { draw: true } },
    },
  });

  return NextResponse.json(profile);
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const body = await req.json();
    const parsed = profileSchema.parse(body);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: parsed.name,
        charityId: parsed.charityId,
        charityPct: parsed.charityPct,
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Invalid profile data" },
      { status: 400 }
    );
  }
}
