import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const VALID_STATUSES = ["pending", "active", "rejected"];

  const data: Record<string, unknown> = {};
  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status))
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    data.status = body.status;
  }
  if (body.isVerified !== undefined) data.isVerified = Boolean(body.isVerified);
  if (body.adminNote !== undefined) data.adminNote = body.adminNote;
  if (body.isActive !== undefined) data.isActive = body.isActive;

  // Track price history when price changes
  if (body.price !== undefined) {
    const current = await prisma.listing.findUnique({
      where: { id: parseInt(id) },
      select: { price: true, priceHistory: true },
    });
    if (current && current.price !== body.price) {
      const history = JSON.parse(current.priceHistory || "[]") as { price: number; date: string }[];
      history.push({ price: current.price, date: new Date().toISOString() });
      data.priceHistory = JSON.stringify(history.slice(-10));
    }
    data.price = body.price;
  }

  const listing = await prisma.listing.update({
    where: { id: parseInt(id) },
    data,
  });

  return NextResponse.json({
    ...listing,
    images: JSON.parse(listing.images || "[]"),
    createdAt: listing.createdAt.toISOString(),
    updatedAt: listing.updatedAt.toISOString(),
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.listing.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ ok: true });
}
