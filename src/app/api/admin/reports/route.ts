import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "new";

  const reports = await prisma.listingReport.findMany({
    where: status === "all" ? {} : { status },
    include: {
      listing: { select: { id: true, brand: true, model: true, year: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(
    reports.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))
  );
}

export async function PATCH(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status } = await request.json();
  const updated = await prisma.listingReport.update({ where: { id }, data: { status } });
  return NextResponse.json({ ok: true, status: updated.status });
}
