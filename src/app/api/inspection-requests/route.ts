import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, phone, email, carBrand, carModel, carYear, message } = body;

  if (!name || !phone || !carBrand || !carModel || !carYear) {
    return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
  }

  const req = await prisma.inspectionRequest.create({
    data: {
      name,
      phone,
      email: email || null,
      carBrand,
      carModel,
      carYear: parseInt(carYear),
      message: message || null,
      status: "new",
    },
  });

  return NextResponse.json({ ok: true, id: req.id });
}
