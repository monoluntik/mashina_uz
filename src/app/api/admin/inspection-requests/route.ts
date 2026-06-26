import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;

  const requests = await prisma.inspectionRequest.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    requests.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      scheduledAt: r.scheduledAt?.toISOString() || null,
    }))
  );
}
