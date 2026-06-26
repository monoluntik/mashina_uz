import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const REASONS = ["fake", "wrong_price", "already_sold", "duplicate", "spam", "other"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { reason, details, contact } = await request.json();

  if (!reason || !REASONS.includes(reason)) {
    return NextResponse.json({ error: "Укажите причину" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({
    where: { id: parseInt(id) },
    select: { id: true },
  });
  if (!listing) return NextResponse.json({ error: "Объявление не найдено" }, { status: 404 });

  await prisma.listingReport.create({
    data: { listingId: listing.id, reason, details: details || null, contact: contact || null },
  });

  return NextResponse.json({ ok: true });
}
