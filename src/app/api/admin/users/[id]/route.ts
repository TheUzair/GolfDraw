import { NextResponse } from "next/server";
import { getCurrentUser, unauthorized, forbidden } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "ADMIN") return forbidden();

  const { id } = await params;

  const targetUser = await prisma.user.findUnique({
    where: { id },
    include: {
      subscription: true,
      charity: true,
      scores: { orderBy: { playedAt: "desc" } },
      winners: { include: { draw: true } },
      donations: { include: { charity: true } },
    },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ ...targetUser, hashedPassword: undefined });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "ADMIN") return forbidden();

  const { id } = await params;

  try {
    const body = await req.json();
    const { name, role, charityId, charityPct } = body;

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: name || undefined,
        role: role || undefined,
        charityId: charityId || undefined,
        charityPct: charityPct || undefined,
      },
    });

    return NextResponse.json({ ...updated, hashedPassword: undefined });
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
