import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { listingId, ...reportData } = body;

  if (!listingId) return NextResponse.json({ error: "listingId required" }, { status: 400 });

  const SCORE_FIELDS = ["engine", "transmission", "suspension", "brakes", "electrical", "interior", "tires"] as const;
  const scores: Record<string, number> = {};
  for (const field of SCORE_FIELDS) {
    const val = parseInt(reportData[field]);
    if (isNaN(val) || val < 1 || val > 5)
      return NextResponse.json({ error: `Оценка ${field} должна быть от 1 до 5` }, { status: 400 });
    scores[field] = val;
  }

  // upsert so re-submitting a report updates it
  const report = await prisma.inspectionReport.upsert({
    where: { listingId: parseInt(listingId) },
    update: {
      engine: scores.engine,
      transmission: scores.transmission,
      suspension: scores.suspension,
      brakes: scores.brakes,
      electrical: scores.electrical,
      interior: scores.interior,
      tires: scores.tires,
      bodyPanels: JSON.stringify(reportData.bodyPanels || {}),
      hasAccident: reportData.hasAccident === true,
      accidentDetails: reportData.accidentDetails || null,
      mileageVerified: reportData.mileageVerified !== false,
      inspectorNotes: reportData.inspectorNotes || "",
      inspectorName: reportData.inspectorName || session.name,
      inspectedAt: new Date(reportData.inspectedAt || Date.now()),
    },
    create: {
      listingId: parseInt(listingId),
      engine: scores.engine,
      transmission: scores.transmission,
      suspension: scores.suspension,
      brakes: scores.brakes,
      electrical: scores.electrical,
      interior: scores.interior,
      tires: scores.tires,
      bodyPanels: JSON.stringify(reportData.bodyPanels || {}),
      hasAccident: reportData.hasAccident === true,
      accidentDetails: reportData.accidentDetails || null,
      mileageVerified: reportData.mileageVerified !== false,
      inspectorNotes: reportData.inspectorNotes || "",
      inspectorName: reportData.inspectorName || session.name,
      inspectedAt: new Date(reportData.inspectedAt || Date.now()),
    },
  });

  // auto-mark listing as verified
  await prisma.listing.update({
    where: { id: parseInt(listingId) },
    data: { isVerified: true, status: "active" },
  });

  return NextResponse.json({ ok: true, id: report.id });
}

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const listingId = searchParams.get("listingId");

  if (!listingId) return NextResponse.json({ error: "listingId required" }, { status: 400 });

  const report = await prisma.inspectionReport.findUnique({
    where: { listingId: parseInt(listingId) },
  });

  if (!report) return NextResponse.json(null);

  return NextResponse.json({
    ...report,
    bodyPanels: JSON.parse(report.bodyPanels || "{}"),
    inspectedAt: report.inspectedAt.toISOString(),
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString(),
  });
}
