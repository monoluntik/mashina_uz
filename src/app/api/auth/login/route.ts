import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signUserToken, USER_COOKIE } from "@/lib/userAuth";
import { isRateLimited } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(`login:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Слишком много попыток. Попробуйте через 15 минут." }, { status: 429 });
  }

  const body = await request.json();
  const { login, password } = body; // login = phone or email

  if (!login || !password) {
    return NextResponse.json({ error: "Login and password required" }, { status: 400 });
  }

  const isEmail = login.includes("@");
  const user = isEmail
    ? await prisma.user.findUnique({ where: { email: login } })
    : await prisma.user.findFirst({
        where: {
          phone: {
            contains: login.replace(/\D/g, "").slice(-9),
          },
        },
      });

  if (!user) return NextResponse.json({ error: "not_found" }, { status: 401 });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return NextResponse.json({ error: "wrong_password" }, { status: 401 });

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
