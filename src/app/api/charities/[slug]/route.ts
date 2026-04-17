import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const charity = await prisma.charity.findUnique({
    where: { slug },
    include: {
      _count: { select: { users: true, donations: true } },
    },
  });

  if (!charity) {
    return NextResponse.json({ error: "Charity not found" }, { status: 404 });
  }

  return NextResponse.json(charity);
}
