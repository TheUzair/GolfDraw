import { NextResponse } from "next/server";
import { getCurrentUser, unauthorized, forbidden } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { charitySchema } from "@/lib/validations";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "ADMIN") return forbidden();

  const charities = await prisma.charity.findMany({
    include: { _count: { select: { users: true, donations: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(charities);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "ADMIN") return forbidden();

  try {
    const body = await req.json();
    const parsed = charitySchema.parse(body);

    const charity = await prisma.charity.create({
      data: {
        name: parsed.name,
        slug: parsed.slug,
        description: parsed.description,
        image: parsed.image || null,
        website: parsed.website || null,
        featured: parsed.featured || false,
        active: parsed.active !== undefined ? parsed.active : true,
      },
    });

    return NextResponse.json(charity, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid charity data" },
      { status: 400 }
    );
  }
}
