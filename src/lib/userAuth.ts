import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "mashina-uz-secret-change-in-prod-2024";
const COOKIE = "user_token";

export interface UserPayload {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
}

export function signUserToken(payload: UserPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

export function verifyUserToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, SECRET) as UserPayload;
  } catch {
    return null;
  }
}

export async function getUserSession(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;
  return verifyUserToken(token);
}

export { COOKIE as USER_COOKIE };
