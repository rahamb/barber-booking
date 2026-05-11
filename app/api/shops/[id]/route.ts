// app/api/shops/[id]/route.ts
// Returns one shop, its services, and available slots for a given date
// Test: GET /api/shops/SHOP_ID_HERE?date=2025-06-15

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const date = request.nextUrl.searchParams.get("date");

  try {
    // Get the shop and all its active services
    const shop = await db.shop.findUnique({
      where: { id },
      include: {
        services: true,
      },
    });

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    // If a date was provided, also return slots for that day
    let slots: { id: string; time: string; isBooked: boolean }[] = [];
    if (date) {
      slots = await db.slot.findMany({
        where: {
          shopId: id,
          date: date,
          isBooked: false, // Only show available slots
        },
        orderBy: { time: "asc" },
        select: { id: true, time: true, isBooked: true },
      });
    }

    return NextResponse.json({ shop, slots });
  } catch (error) {
    console.error("Shop detail error:", error);
    return NextResponse.json({ error: "Failed to load shop" }, { status: 500 });
  }
}