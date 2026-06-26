import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, setAdminCookie } from "@/lib/auth";
import { isRateLimited } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(`admin-login:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  }

  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as "admin" | "moderator",
  });

  const cookie = setAdminCookie(token);
  const res = NextResponse.json({ ok: true, role: user.role, name: user.name });
  res.cookies.set(cookie.name, cookie.value, cookie.options as Parameters<typeof res.cookies.set>[2]);
  return res;
}
