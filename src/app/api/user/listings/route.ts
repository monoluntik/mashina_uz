import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserSession } from "@/lib/userAuth";

export async function GET() {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const listings = await prisma.listing.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
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
