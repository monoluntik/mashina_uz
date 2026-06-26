import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signUserToken, USER_COOKIE } from "@/lib/userAuth";
import { isRateLimited } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(`register:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Слишком много попыток регистрации. Попробуйте через час." }, { status: 429 });
  }

  const body = await request.json();
  const { name, phone, email, password } = body;

  if (!name || !password || (!phone && !email)) {
    return NextResponse.json({ error: "Name, password and phone or email required" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  // normalise phone
  const normalPhone = phone ? phone.replace(/\D/g, "").replace(/^998/, "+998") || "+" + phone.replace(/\D/g, "") : null;

  // check uniqueness
  if (normalPhone) {
    const exists = await prisma.user.findUnique({ where: { phone: normalPhone } });
    if (exists) return NextResponse.json({ error: "phone_taken" }, { status: 409 });
  }
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return NextResponse.json({ error: "Неверный формат email" }, { status: 400 });
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return NextResponse.json({ error: "email_taken" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, phone: normalPhone, email: email || null, password: hashed },
  });

  const token = signUserToken({ id: user.id, name: user.name, phone: user.phone, email: user.email });

  const res = NextResponse.json({ ok: true, name: user.name });
  res.cookies.set(USER_COOKIE, token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });
  return res;
}
