import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signUserToken, USER_COOKIE } from "@/lib/userAuth";

export async function POST(request: NextRequest) {
  const { token, password } = await request.json();
  if (!token || !password) return NextResponse.json({ error: "Недостаточно данных" }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: "Пароль минимум 6 символов" }, { status: 400 });

  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record || record.used || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "Ссылка недействительна или устарела" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { id: record.userId }, data: { password: hashed } });
  await prisma.passwordResetToken.update({ where: { token }, data: { used: true } });

  const jwt = signUserToken({
    id: record.user.id,
    name: record.user.name,
    phone: record.user.phone,
    email: record.user.email,
  });

  const response = NextResponse.json({ ok: true, name: record.user.name });
  response.cookies.set(USER_COOKIE, jwt, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
  });
  return response;
}
