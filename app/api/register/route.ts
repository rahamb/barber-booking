// app/api/register/route.ts
// Creates a new shop + admin account in one go
// Called when a shop owner fills in the signup form

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    shopName, shopType, address, postcode, city, phone,
    adminEmail, adminPassword,
  } = body;

  // Validate every field is present
  if (!shopName || !shopType || !address || !postcode ||
      !city || !adminEmail || !adminPassword) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  if (adminPassword.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  if (!adminEmail.includes("@")) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 }
    );
  }

  try {
    // Check email not already taken
    const existing = await db.admin.findUnique({
      where: { email: adminEmail.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password before storing
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Create shop and admin in one transaction
    const { shop, admin } = await db.$transaction(async (tx) => {
      const shop = await tx.shop.create({
        data: {
          name: shopName.trim(),
          type: shopType,
          address: address.trim(),
          postcode: postcode.trim().toUpperCase(),
          city: city.trim(),
          phone: phone?.trim() || null,
        },
      });

      const admin = await tx.admin.create({
        data: {
          email: adminEmail.toLowerCase().trim(),
          passwordHash,
          shopId: shop.id,
        },
      });

      return { shop, admin };
    });

    // Log them in straight away — no need to log in separately
    await createSession(admin.id, shop.id);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}