// app/api/admin/login/route.ts
// Checks email + password, creates a session if correct

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  try {
    // Find admin by email
    const admin = await db.admin.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!admin) {
      // Don't say "email not found" — that reveals valid emails
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check password against the stored hash
    const passwordMatch = await bcrypt.compare(password, admin.passwordHash);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Password correct — create session cookie
    await createSession(admin.id, admin.shopId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}