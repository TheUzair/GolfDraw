import { NextResponse } from "next/server";
import { getCurrentUser, unauthorized, forbidden } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { charitySchema } from "@/lib/validations";

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
    const parsed = charitySchema.parse(body);

    const charity = await prisma.charity.update({
      where: { id },
      data: {
        name: parsed.name,
        slug: parsed.slug,
        description: parsed.description,
        image: parsed.image || null,
        website: parsed.website || null,
        featured: parsed.featured,
        active: parsed.active,
      },
    });

    return NextResponse.json(charity);
  } catch {
    return NextResponse.json(
      { error: "Invalid charity data" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "ADMIN") return forbidden();

  const { id } = await params;

  await prisma.charity.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
