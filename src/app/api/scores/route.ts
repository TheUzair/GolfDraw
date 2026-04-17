import { NextResponse } from "next/server";
import { getCurrentUser, unauthorized, badRequest } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { scoreSchema } from "@/lib/validations";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const scores = await prisma.score.findMany({
    where: { userId: user.id },
    orderBy: { playedAt: "desc" },
    take: 5,
  });

  return NextResponse.json(scores);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  if (user.subscription?.status !== "ACTIVE" && user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Active subscription required" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const parsed = scoreSchema.parse(body);

    const playedAt = new Date(parsed.playedAt);

    // Check for duplicate date
    const existing = await prisma.score.findUnique({
      where: {
        userId_playedAt: {
          userId: user.id,
          playedAt: playedAt,
        },
      },
    });

    if (existing) {
      return badRequest("A score already exists for this date. Please edit or delete it instead.");
    }

    // Count current scores
    const scores = await prisma.score.findMany({
      where: { userId: user.id },
      orderBy: { playedAt: "desc" },
    });

    // If 5 scores exist, delete the oldest
    if (scores.length >= 5) {
      const oldest = scores[scores.length - 1];
      await prisma.score.delete({ where: { id: oldest.id } });
    }

    const score = await prisma.score.create({
      data: {
        userId: user.id,
        value: parsed.value,
        playedAt: playedAt,
      },
    });

    return NextResponse.json(score, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return badRequest("Invalid score data");
    }
    console.error("Score creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
