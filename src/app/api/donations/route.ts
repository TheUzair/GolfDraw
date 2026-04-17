import { NextResponse } from "next/server";
import { getCurrentUser, unauthorized, badRequest } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { donationSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const body = await req.json();
    const parsed = donationSchema.parse(body);

    const charity = await prisma.charity.findUnique({
      where: { id: parsed.charityId },
    });

    if (!charity) {
      return badRequest("Charity not found");
    }

    const donation = await prisma.donation.create({
      data: {
        userId: user.id,
        charityId: parsed.charityId,
        amount: parsed.amount,
      },
    });

    return NextResponse.json(donation, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid donation data" },
      { status: 400 }
    );
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const donations = await prisma.donation.findMany({
    where: { userId: user.id },
    include: { charity: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(donations);
}
