import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const listingId = parseInt(id);
  if (isNaN(listingId)) return NextResponse.json({ ok: false }, { status: 400 });

  const jar = await cookies();
  const key = `viewed_${listingId}`;

  if (!jar.has(key)) {
    await prisma.listing.update({
      where: { id: listingId },
      data: { views: { increment: 1 } },
    });
    const res = NextResponse.json({ ok: true, incremented: true });
    res.cookies.set(key, "1", { maxAge: 60 * 60 * 24, httpOnly: true, path: "/" });
    return res;
  }

  return NextResponse.json({ ok: true, incremented: false });
}
