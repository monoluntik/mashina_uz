import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids");

  if (!ids) return NextResponse.json([]);

  const idList = ids.split(",").map(Number).filter(Boolean).slice(0, 50);
  const listings = await prisma.listing.findMany({
    where: { id: { in: idList }, isActive: true, status: "active" },
  });

  return NextResponse.json(
    listings.map((l) => ({
      ...l,
      images: JSON.parse(l.images || "[]"),
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
    }))
  );
}
