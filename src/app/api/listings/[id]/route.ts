import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const listingId = parseInt(id);
  if (isNaN(listingId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
  });

  if (!listing || !listing.isActive || listing.status !== "active") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...listing,
    images: JSON.parse(listing.images || "[]"),
    createdAt: listing.createdAt.toISOString(),
    updatedAt: listing.updatedAt.toISOString(),
  });
}
