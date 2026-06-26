import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserSession } from "@/lib/userAuth";

export async function GET() {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const history = await prisma.viewHistory.findMany({
    where: { userId: session.id },
    include: { listing: true },
    orderBy: { viewedAt: "desc" },
    take: 20,
  });

  return NextResponse.json(
    history
      .filter((h) => h.listing.isActive && h.listing.status === "active")
      .map((h) => ({
        ...h.listing,
        images: JSON.parse(h.listing.images || "[]"),
        createdAt: h.listing.createdAt.toISOString(),
        updatedAt: h.listing.updatedAt.toISOString(),
        viewedAt: h.viewedAt.toISOString(),
      }))
  );
}

export async function POST(request: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ ok: false });

  const { listingId } = await request.json();
  if (!listingId) return NextResponse.json({ ok: false });

  try {
    await prisma.viewHistory.upsert({
      where: { userId_listingId: { userId: session.id, listingId: parseInt(listingId) } },
      create: { userId: session.id, listingId: parseInt(listingId) },
      update: { viewedAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
