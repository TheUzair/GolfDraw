import { NextResponse } from "next/server";
import { getCurrentUser, unauthorized, forbidden } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { drawConfigSchema } from "@/lib/validations";
import { MatchType } from "@/generated/prisma/client";
import {
  sendEmail,
  drawResultEmail,
  winnerNotificationEmail,
} from "@/lib/email";

function generateDrawNumbers(): number[] {
  const numbers: number[] = [];
  while (numbers.length < 5) {
    const n = Math.floor(Math.random() * 45) + 1;
    if (!numbers.includes(n)) numbers.push(n);
  }
  return numbers.sort((a, b) => a - b);
}

async function generateAlgorithmicNumbers(): Promise<number[]> {
  // Frequency-weighted: uses most/least frequent user scores
  const scores = await prisma.score.findMany({
    select: { value: true },
  });

  const freq: Record<number, number> = {};
  for (let i = 1; i <= 45; i++) freq[i] = 0;
  scores.forEach((s) => freq[s.value]++);

  // Weighted selection — higher frequency = higher chance
  const entries = Object.entries(freq).map(([num, count]) => ({
    num: parseInt(num),
    weight: count + 1, // +1 so all numbers have a chance
  }));

  const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0);
  const numbers: number[] = [];

  while (numbers.length < 5) {
    let random = Math.random() * totalWeight;
    for (const entry of entries) {
      random -= entry.weight;
      if (random <= 0 && !numbers.includes(entry.num)) {
        numbers.push(entry.num);
        break;
      }
    }
  }

  return numbers.sort((a, b) => a - b);
}

function countMatches(userNumbers: number[], drawNumbers: number[]): number {
  return userNumbers.filter((n) => drawNumbers.includes(n)).length;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "ADMIN") return forbidden();

  const draws = await prisma.draw.findMany({
    orderBy: [{ year: "desc" }, { month: "desc" }],
    include: {
      results: true,
      _count: { select: { entries: true, winners: true } },
    },
  });

  return NextResponse.json(draws);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "ADMIN") return forbidden();

  try {
    const body = await req.json();
    const parsed = drawConfigSchema.parse(body);

    // Calculate prize pool from active subscriptions
    const activeSubscribers = await prisma.subscription.count({
      where: { status: "ACTIVE" },
    });

    const monthlyRevenue = activeSubscribers * 9.99; // simplified
    const prizePoolTotal = monthlyRevenue * 0.5; // 50% to prize pool

    // Check for existing rollover
    const previousDraw = await prisma.draw.findFirst({
      where: {
        status: "PUBLISHED",
        year: { lte: parsed.year },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    const rollover = previousDraw?.rolloverAmount || 0;

    const draw = await prisma.draw.upsert({
      where: {
        month_year: { month: parsed.month, year: parsed.year },
      },
      create: {
        month: parsed.month,
        year: parsed.year,
        drawType: parsed.drawType,
        prizePool: prizePoolTotal,
        jackpotPool: prizePoolTotal * 0.4 + rollover,
        fourMatchPool: prizePoolTotal * 0.35,
        threeMatchPool: prizePoolTotal * 0.25,
        rolloverAmount: 0,
      },
      update: {
        drawType: parsed.drawType,
        prizePool: prizePoolTotal,
        jackpotPool: prizePoolTotal * 0.4 + rollover,
        fourMatchPool: prizePoolTotal * 0.35,
        threeMatchPool: prizePoolTotal * 0.25,
      },
    });

    return NextResponse.json(draw, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid draw configuration" },
      { status: 400 }
    );
  }
}

// Simulate or execute a draw
export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "ADMIN") return forbidden();

  try {
    const { drawId, action } = await req.json();

    const draw = await prisma.draw.findUnique({
      where: { id: drawId },
      include: { entries: true },
    });

    if (!draw) {
      return NextResponse.json({ error: "Draw not found" }, { status: 404 });
    }

    // Generate draw numbers
    const numbers =
      draw.drawType === "ALGORITHMIC"
        ? await generateAlgorithmicNumbers()
        : generateDrawNumbers();

    if (action === "simulate") {
      // Return simulation results without saving
      const simResults = draw.entries.map((entry) => ({
        userId: entry.userId,
        matches: countMatches(entry.numbers, numbers),
      }));

      return NextResponse.json({
        numbers,
        results: simResults,
        fiveMatch: simResults.filter((r) => r.matches >= 5).length,
        fourMatch: simResults.filter((r) => r.matches === 4).length,
        threeMatch: simResults.filter((r) => r.matches === 3).length,
      });
    }

    if (action === "execute") {
      // Auto-create draw entries from user scores if none exist
      if (draw.entries.length === 0) {
        const subscribers = await prisma.user.findMany({
          where: { subscription: { status: "ACTIVE" } },
          include: {
            scores: {
              orderBy: { playedAt: "desc" },
              take: 5,
            },
          },
        });

        for (const sub of subscribers) {
          if (sub.scores.length > 0) {
            const userNumbers = sub.scores
              .map((s) => s.value)
              .sort((a, b) => a - b);
            await prisma.drawEntry.create({
              data: {
                drawId: draw.id,
                userId: sub.id,
                numbers: userNumbers,
              },
            });
          }
        }

        // Re-fetch draw with entries
        const refreshed = await prisma.draw.findUnique({
          where: { id: drawId },
          include: { entries: true },
        });
        if (refreshed) draw.entries = refreshed.entries;
      }

      // Execute and save results
      const matchTypes: { type: MatchType; min: number }[] = [
        { type: "FIVE_MATCH", min: 5 },
        { type: "FOUR_MATCH", min: 4 },
        { type: "THREE_MATCH", min: 3 },
      ];

      const pools: Record<string, number> = {
        FIVE_MATCH: draw.jackpotPool,
        FOUR_MATCH: draw.fourMatchPool,
        THREE_MATCH: draw.threeMatchPool,
      };

      let hasJackpotWinner = false;

      for (const { type, min } of matchTypes) {
        const matchingEntries = draw.entries.filter(
          (entry) => countMatches(entry.numbers, numbers) >= min
        );

        const prizePerWinner =
          matchingEntries.length > 0
            ? pools[type] / matchingEntries.length
            : 0;

        if (type === "FIVE_MATCH" && matchingEntries.length > 0) {
          hasJackpotWinner = true;
        }

        await prisma.drawResult.create({
          data: {
            drawId: draw.id,
            matchType: type,
            winnerCount: matchingEntries.length,
            prizeAmount: prizePerWinner,
          },
        });

        for (const entry of matchingEntries) {
          await prisma.winner.create({
            data: {
              drawId: draw.id,
              userId: entry.userId,
              matchType: type,
              prizeAmount: prizePerWinner,
            },
          });
        }
      }

      // Update draw
      await prisma.draw.update({
        where: { id: drawId },
        data: {
          numbers,
          status: "EXECUTED",
          executedAt: new Date(),
          rolloverAmount: hasJackpotWinner ? 0 : draw.jackpotPool,
        },
      });

      return NextResponse.json({ success: true, numbers });
    }

    if (action === "publish") {
      await prisma.draw.update({
        where: { id: drawId },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });

      // Send email notifications
      const months = [
        "", "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ];
      const monthName = months[draw.month] || `Month ${draw.month}`;

      // Notify all subscribers about draw results
      const subscribers = await prisma.user.findMany({
        where: { subscription: { status: "ACTIVE" } },
        select: { email: true, name: true },
      });

      for (const sub of subscribers) {
        const emailContent = drawResultEmail(
          sub.name || "Golfer",
          monthName,
          draw.year
        );
        sendEmail({ to: sub.email, ...emailContent }).catch(() => { });
      }

      // Notify winners specifically
      const winners = await prisma.winner.findMany({
        where: { drawId: draw.id },
        include: { user: { select: { email: true, name: true } } },
      });

      for (const winner of winners) {
        const emailContent = winnerNotificationEmail(
          winner.user.name || "Golfer",
          winner.prizeAmount
        );
        sendEmail({ to: winner.user.email, ...emailContent }).catch(() => { });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Draw execution error:", error);
    return NextResponse.json(
      { error: "Draw execution failed" },
      { status: 500 }
    );
  }
}
