import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const brand = searchParams.get("brand");
  const model = searchParams.get("model");
  const ids = searchParams.get("ids");

  // Batch: return avg price per brand+model for a list of listing ids
  if (ids) {
    const idList = ids.split(",").map(Number).filter(Boolean).slice(0, 20);
    const listings = await prisma.listing.findMany({
      where: { id: { in: idList }, isActive: true },
      select: { id: true, brand: true, model: true, price: true },
    });

    // Batch: one query per unique brand (not per listing) to avoid N+1
    const brands = [...new Set(listings.map((l) => l.brand))];
    const peersByBrand: Record<string, number[]> = {};
    await Promise.all(
      brands.map(async (brand) => {
        const rows = await prisma.listing.findMany({
          where: { brand, isActive: true, status: "active" },
          select: { price: true },
          take: 200,
        });
        peersByBrand[brand] = rows.map((r) => r.price);
      })
    );

    const result: Record<number, "low" | "fair" | "high"> = {};
    for (const l of listings) {
      const prices = peersByBrand[l.brand] || [];
      if (prices.length < 2) continue;
      const avg = prices.reduce((s, p) => s + p, 0) / prices.length;
      const ratio = l.price / avg;
      result[l.id] = ratio < 0.92 ? "low" : ratio > 1.08 ? "high" : "fair";
    }

    return NextResponse.json(result);
  }

  // Single: return avg price for brand+model
  if (!brand) return NextResponse.json({ error: "brand required" }, { status: 400 });

  const where: Record<string, unknown> = { brand, isActive: true };
  if (model) where.model = { contains: model.split(" ")[0] };

  const rows = await prisma.listing.findMany({ where, select: { price: true } });
  if (rows.length === 0) return NextResponse.json({ avg: null, count: 0 });

  const avg = Math.round(rows.reduce((s, r) => s + r.price, 0) / rows.length);
  return NextResponse.json({ avg, count: rows.length });
}
