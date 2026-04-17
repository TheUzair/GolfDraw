import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const featured = searchParams.get("featured");

  const where: Record<string, unknown> = { active: true };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (featured === "true") {
    where.featured = true;
  }

  const charities = await prisma.charity.findMany({
    where,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(charities);
}
