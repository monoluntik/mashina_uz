import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserSession } from "@/lib/userAuth";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getUserSession();
  if (!session) return NextResponse.json(null);

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, phone: true, email: true, createdAt: true },
  });
  if (!user) return NextResponse.json(null);

  return NextResponse.json({ ...user, createdAt: user.createdAt.toISOString() });
}

export async function PATCH(request: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const data: Record<string, unknown> = {};

  if (body.name) data.name = body.name;
  if (body.phone !== undefined) data.phone = body.phone || null;
  if (body.email !== undefined) data.email = body.email || null;
  if (body.newPassword) {
    if (!body.currentPassword) {
      return NextResponse.json({ error: "current_password_required" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const valid = await bcrypt.compare(body.currentPassword, user.password);
    if (!valid) return NextResponse.json({ error: "wrong_password" }, { status: 401 });
    data.password = await bcrypt.hash(body.newPassword, 10);
  }

  const updated = await prisma.user.update({
    where: { id: session.id },
    data,
    select: { id: true, name: true, phone: true, email: true },
  });

  return NextResponse.json(updated);
}
