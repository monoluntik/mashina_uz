import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.adminUser.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() })));
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email, password, name, role } = await request.json();
  if (!email || !password || !name) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Email already exists" }, { status: 400 });

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.adminUser.create({
    data: { email, password: hashed, name, role: role || "moderator" },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  return NextResponse.json({ ...user, createdAt: user.createdAt.toISOString() });
}

export async function DELETE(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await request.json();
  if (id === session.id) return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });

  await prisma.adminUser.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
