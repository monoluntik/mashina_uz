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

  const data: Record<string, unknown> = {};
  if (body.status !== undefined) data.status = body.status;
  if (body.scheduledAt !== undefined)
    data.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
  if (body.listingId !== undefined) data.listingId = body.listingId;

  const updated = await prisma.inspectionRequest.update({
    where: { id: parseInt(id) },
    data,
  });

  return NextResponse.json({
    ...updated,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    scheduledAt: updated.scheduledAt?.toISOString() || null,
  });
}
