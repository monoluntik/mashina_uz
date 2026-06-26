import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { login } = await request.json();
  if (!login) return NextResponse.json({ error: "Укажите email или телефон" }, { status: 400 });

  const isEmail = login.includes("@");
  const user = isEmail
    ? await prisma.user.findUnique({ where: { email: login.trim().toLowerCase() } })
    : await prisma.user.findFirst({
        where: { phone: { contains: login.replace(/\D/g, "").slice(-9) } },
      });

  // Always return ok to prevent user enumeration
  if (!user) return NextResponse.json({ ok: true });

  // Invalidate old tokens
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true },
  });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  // In production: send email/SMS with reset link
  // For development: log token to console
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:9000";
  const resetLinkRu = `${base}/ru/reset-password?token=${token}`;
  const resetLinkUz = `${base}/uz/reset-password?token=${token}`;
  console.log(`\n🔑 Password reset link for ${user.name}:\n  RU: ${resetLinkRu}\n  UZ: ${resetLinkUz}\n`);

  return NextResponse.json({ ok: true });
}
