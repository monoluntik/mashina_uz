import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.listing.count({ where }),
  ]);

  return NextResponse.json({
    listings: listings.map((l) => ({
      ...l,
      images: JSON.parse(l.images || "[]"),
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
    })),
    total,
  });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const listing = await prisma.listing.create({
    data: {
      title: `${body.brand} ${body.model} ${body.year}`,
      brand: body.brand,
      model: body.model,
      year: parseInt(body.year),
      price: parseInt(body.price),
      mileage: parseInt(body.mileage),
      city: body.city,
      description: body.description || "",
      images: JSON.stringify(body.images || []),
      fuelType: body.fuelType,
      transmission: body.transmission,
      color: body.color,
      bodyType: body.bodyType,
      engineVolume: parseFloat(body.engineVolume),
      driveType: body.driveType,
      condition: body.condition || "used",
      status: "active",
      isVerified: body.isVerified === true,
      sellerName: body.sellerName || session.name,
      sellerPhone: body.sellerPhone || "+998 71 200 00 00",
    },
  });

  return NextResponse.json({
    ...listing,
    images: JSON.parse(listing.images || "[]"),
    createdAt: listing.createdAt.toISOString(),
    updatedAt: listing.updatedAt.toISOString(),
  });
}
