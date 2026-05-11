// lib/auth.ts
// Two jobs:
// 1. createSession  — makes a signed token and puts it in a cookie
// 2. getSession     — reads the cookie and tells us who is logged in

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// The secret key used to sign tokens — comes from .env.local
const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "fallback-secret-change-this"
);

const COOKIE_NAME = "admin_session";

// Called after a successful login — creates a cookie
export async function createSession(adminId: string, shopId: string) {
  const token = await new SignJWT({ adminId, shopId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d") // stays logged in for 7 days
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,   // JS can't read this cookie — safer
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    path: "/",
  });
}

// Called on every admin page — returns session data or null
export async function getSession(): Promise<{
  adminId: string;
  shopId: string;
} | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET);
    return {
      adminId: payload.adminId as string,
      shopId: payload.shopId as string,
    };
  } catch {
    // Token expired or invalid
    return null;
  }
}

// Called when admin clicks logout
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}