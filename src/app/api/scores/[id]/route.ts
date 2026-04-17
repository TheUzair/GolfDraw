import { NextResponse } from "next/server";
import { getCurrentUser, unauthorized, badRequest } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { scoreSchema } from "@/lib/validations";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await params;

  const score = await prisma.score.findUnique({ where: { id } });
  if (!score || score.userId !== user.id) {
    return NextResponse.json({ error: "Score not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = scoreSchema.parse(body);
    const playedAt = new Date(parsed.playedAt);

    // Check duplicate date (excluding current score)
    const existing = await prisma.score.findFirst({
      where: {
        userId: user.id,
        playedAt: playedAt,
        NOT: { id },
      },
    });

    if (existing) {
      return badRequest("A score already exists for this date.");
    }

    const updated = await prisma.score.update({
      where: { id },
      data: { value: parsed.value, playedAt },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return badRequest("Invalid score data");
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await params;

  const score = await prisma.score.findUnique({ where: { id } });
  if (!score || score.userId !== user.id) {
    return NextResponse.json({ error: "Score not found" }, { status: 404 });
  }

  await prisma.score.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
