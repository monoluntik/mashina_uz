import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserSession } from "@/lib/userAuth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const brand = searchParams.get("brand") || undefined;
  const model = searchParams.get("model") || undefined;
  const yearFrom = searchParams.get("yearFrom")
    ? parseInt(searchParams.get("yearFrom")!)
    : undefined;
  const yearTo = searchParams.get("yearTo")
    ? parseInt(searchParams.get("yearTo")!)
    : undefined;
  const priceFrom = searchParams.get("priceFrom")
    ? parseInt(searchParams.get("priceFrom")!)
    : undefined;
  const priceTo = searchParams.get("priceTo")
    ? parseInt(searchParams.get("priceTo")!)
    : undefined;
  const city = searchParams.get("city") || undefined;
  const bodyType = searchParams.get("bodyType") || undefined;
  const fuelType = searchParams.get("fuelType") || undefined;
  const transmission = searchParams.get("transmission") || undefined;
  const condition    = searchParams.get("condition")    || undefined;
  const driveType    = searchParams.get("driveType")    || undefined;
  const color        = searchParams.get("color")        || undefined;
  const mileageFrom  = searchParams.get("mileageFrom")  ? parseInt(searchParams.get("mileageFrom")!)  : undefined;
  const mileageTo    = searchParams.get("mileageTo")    ? parseInt(searchParams.get("mileageTo")!)    : undefined;
  const engineFrom   = searchParams.get("engineFrom")   ? parseFloat(searchParams.get("engineFrom")!) : undefined;
  const engineTo     = searchParams.get("engineTo")     ? parseFloat(searchParams.get("engineTo")!)   : undefined;
  const isVerified   = searchParams.get("isVerified") === "true" ? true : undefined;
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");

  const where: Record<string, unknown> = { isActive: true, status: "active" };
  if (brand) where.brand = brand;
  if (model) where.model = { contains: model };
  if (city) where.city = city;
  if (bodyType) where.bodyType = bodyType;
  if (fuelType) where.fuelType = fuelType;
  if (transmission) where.transmission = transmission;
  if (condition)  where.condition  = condition;
  if (driveType)  where.driveType  = driveType;
  if (color)      where.color      = color;
  if (isVerified) where.isVerified = true;
  if (mileageFrom || mileageTo) {
    where.mileage = {};
    if (mileageFrom) (where.mileage as Record<string, unknown>).gte = mileageFrom;
    if (mileageTo)   (where.mileage as Record<string, unknown>).lte = mileageTo;
  }
  if (engineFrom || engineTo) {
    where.engineVolume = {};
    if (engineFrom) (where.engineVolume as Record<string, unknown>).gte = engineFrom;
    if (engineTo)   (where.engineVolume as Record<string, unknown>).lte = engineTo;
  }
  if (yearFrom || yearTo) {
    where.year = {};
    if (yearFrom) (where.year as Record<string, unknown>).gte = yearFrom;
    if (yearTo) (where.year as Record<string, unknown>).lte = yearTo;
  }
  if (priceFrom || priceTo) {
    where.price = {};
    if (priceFrom) (where.price as Record<string, unknown>).gte = priceFrom;
    if (priceTo) (where.price as Record<string, unknown>).lte = priceTo;
  }

  const orderBy =
    sort === "priceAsc"
      ? { price: "asc" as const }
      : sort === "priceDesc"
      ? { price: "desc" as const }
      : { createdAt: "desc" as const };

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.listing.count({ where }),
  ]);

  const parsed = listings.map((l) => ({
    ...l,
    images: JSON.parse(l.images || "[]"),
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }));

  const res = NextResponse.json({ listings: parsed, total, page, limit });
  res.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
  return res;
}

const VALID_FUEL_TYPES     = ["Benzin", "Dizel", "Gaz", "Elektr", "Gibrid"];
const VALID_TRANSMISSIONS  = ["Mexanik", "Avtomat", "Robot", "Variator"];
const VALID_BODY_TYPES     = ["Sedan", "Hatchback", "SUV", "Universal", "Minivan", "Coupe", "Pickup", "Convertible"];
const VALID_DRIVE_TYPES    = ["Old", "Orqa", "4x4"];
const VALID_CONDITIONS     = ["new", "used"];

export async function POST(request: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  // Validate required fields
  const required = ["brand", "model", "year", "price", "mileage", "city", "fuelType", "transmission", "color", "bodyType", "engineVolume", "driveType", "sellerName", "sellerPhone"];
  for (const field of required) {
    if (!body[field] && body[field] !== 0) {
      return NextResponse.json({ error: `Поле ${field} обязательно` }, { status: 400 });
    }
  }

  const year  = parseInt(body.year);
  const price = parseInt(body.price);
  const mileage = parseInt(body.mileage);
  const engineVolume = parseFloat(body.engineVolume);

  if (isNaN(year) || year < 1970 || year > new Date().getFullYear() + 1)
    return NextResponse.json({ error: "Неверный год" }, { status: 400 });
  if (isNaN(price) || price < 0 || price > 2_000_000_000)
    return NextResponse.json({ error: "Неверная цена" }, { status: 400 });
  if (isNaN(mileage) || mileage < 0 || mileage > 2_000_000)
    return NextResponse.json({ error: "Неверный пробег" }, { status: 400 });
  if (!VALID_FUEL_TYPES.includes(body.fuelType))
    return NextResponse.json({ error: "Неверный тип топлива" }, { status: 400 });
  if (!VALID_TRANSMISSIONS.includes(body.transmission))
    return NextResponse.json({ error: "Неверная КПП" }, { status: 400 });
  if (!VALID_BODY_TYPES.includes(body.bodyType))
    return NextResponse.json({ error: "Неверный тип кузова" }, { status: 400 });
  if (!VALID_DRIVE_TYPES.includes(body.driveType))
    return NextResponse.json({ error: "Неверный тип привода" }, { status: 400 });
  if (body.condition && !VALID_CONDITIONS.includes(body.condition))
    return NextResponse.json({ error: "Неверное состояние" }, { status: 400 });

  const listing = await prisma.listing.create({
    data: {
      title: `${body.brand} ${body.model} ${year}`,
      brand: String(body.brand),
      model: String(body.model),
      year,
      price,
      mileage,
      city: String(body.city),
      description: String(body.description || "").slice(0, 5000),
      images: JSON.stringify(Array.isArray(body.images) ? body.images.slice(0, 20) : []),
      fuelType: body.fuelType,
      transmission: body.transmission,
      color: String(body.color),
      bodyType: body.bodyType,
      engineVolume,
      driveType: body.driveType,
      condition: body.condition || "used",
      vin: body.vin ? String(body.vin).toUpperCase().slice(0, 17) : null,
      status: "pending",
      isVerified: false,
      sellerName: String(body.sellerName).slice(0, 100),
      sellerPhone: String(body.sellerPhone).slice(0, 20),
      userId: session.id,
    },
  });

  return NextResponse.json({
    ...listing,
    images: JSON.parse(listing.images || "[]"),
    createdAt: listing.createdAt.toISOString(),
    updatedAt: listing.updatedAt.toISOString(),
  });
}
