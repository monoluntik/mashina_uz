import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserSession } from "@/lib/userAuth";

export async function GET() {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const favs = await prisma.favorite.findMany({
    where: { userId: session.id },
    include: {
      listing: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    favs
      .filter((f) => f.listing.isActive && f.listing.status === "active")
      .map((f) => ({
        ...f.listing,
        images: JSON.parse(f.listing.images || "[]"),
        createdAt: f.listing.createdAt.toISOString(),
        updatedAt: f.listing.updatedAt.toISOString(),
      }))
  );
}

export async function POST(request: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { listingId } = await request.json();
  const parsedId = parseInt(listingId);
  if (!listingId || isNaN(parsedId))
    return NextResponse.json({ error: "listingId required" }, { status: 400 });

  const existing = await prisma.favorite.findUnique({
    where: { userId_listingId: { userId: session.id, listingId: parsedId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ isFav: false });
  } else {
    await prisma.favorite.create({ data: { userId: session.id, listingId: parsedId } });
    return NextResponse.json({ isFav: true });
  }
}

// Bulk sync (called on login to merge localStorage favorites)
export async function PUT(request: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ids } = await request.json();
  if (!Array.isArray(ids)) return NextResponse.json({ error: "ids array required" }, { status: 400 });

  const validIds = ids.map(Number).filter((id) => Number.isInteger(id) && id > 0).slice(0, 500);

  for (const id of validIds) {
    await prisma.favorite.upsert({
      where: { userId_listingId: { userId: session.id, listingId: id as number } },
      create: { userId: session.id, listingId: id as number },
      update: {},
    }).catch(() => {});
  }

  const all = await prisma.favorite.findMany({
    where: { userId: session.id },
    select: { listingId: true },
  });
  return NextResponse.json(all.map((f) => f.listingId));
}
