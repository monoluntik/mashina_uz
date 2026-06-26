import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "mashina-uz-secret-change-in-prod-2024";
const COOKIE = "admin_token";

export interface AdminPayload {
  id: number;
  email: string;
  name: string;
  role: "admin" | "moderator";
}

export function signToken(payload: AdminPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, SECRET) as AdminPayload;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function setAdminCookie(token: string): { name: string; value: string; options: Record<string, unknown> } {
  return {
    name: COOKIE,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    },
  };
}

export const COOKIE_NAME = COOKIE;
