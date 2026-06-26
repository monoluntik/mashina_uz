import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserSession } from "@/lib/userAuth";

export async function GET() {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const searches = await prisma.savedSearch.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(searches);
}

export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, filters } = await req.json();
  if (!name?.trim() || !filters) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const count = await prisma.savedSearch.count({ where: { userId: session.id } });
  if (count >= 20) return NextResponse.json({ error: "Максимум 20 сохранённых поисков" }, { status: 400 });
  const search = await prisma.savedSearch.create({
    data: { userId: session.id, name: name.trim(), filters },
  });
  return NextResponse.json(search);
}

export async function DELETE(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await prisma.savedSearch.deleteMany({ where: { id, userId: session.id } });
  return NextResponse.json({ ok: true });
}
