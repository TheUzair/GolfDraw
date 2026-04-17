import { NextResponse } from "next/server";
import { getCurrentUser, unauthorized, forbidden } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { scoreSchema } from "@/lib/validations";

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

// Admin edit/delete user scores
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "ADMIN") return forbidden();

  const { id } = await params;

  try {
    const body = await req.json();
    const { action, scoreId, value, playedAt } = body;

    if (action === "delete" && scoreId) {
      await prisma.score.delete({
        where: { id: scoreId, userId: id },
      });
      return NextResponse.json({ success: true });
    }

    if (action === "update" && scoreId) {
      const parsed = scoreSchema.parse({ value, playedAt });
      const updated = await prisma.score.update({
        where: { id: scoreId, userId: id },
        data: {
          value: parsed.value,
          playedAt: new Date(parsed.playedAt),
        },
      });
      return NextResponse.json(updated);
    }

    if (action === "create") {
      const parsed = scoreSchema.parse({ value, playedAt });
      const existing = await prisma.score.count({ where: { userId: id } });
      if (existing >= 5) {
        const oldest = await prisma.score.findFirst({
          where: { userId: id },
          orderBy: { playedAt: "asc" },
        });
        if (oldest) await prisma.score.delete({ where: { id: oldest.id } });
      }
      const score = await prisma.score.create({
        data: {
          userId: id,
          value: parsed.value,
          playedAt: new Date(parsed.playedAt),
        },
      });
      return NextResponse.json(score, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
