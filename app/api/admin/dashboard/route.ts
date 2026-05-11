// app/api/admin/dashboard/route.ts
// Returns today's bookings + basic stats for the logged-in shop owner

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_request: NextRequest) {
  // Check they are logged in
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0]; // "2025-06-15"

  try {
    // Run all queries at the same time for speed
    const [shop, todayBookings, totalBookings, availableSlots] =
      await Promise.all([

        // The shop this admin owns
        db.shop.findUnique({
          where: { id: session.shopId },
          select: { id: true, name: true, type: true },
        }),

        // Today's bookings with full details
        db.booking.findMany({
          where: {
            slot: { shopId: session.shopId, date: today },
          },
          include: {
            slot: { select: { date: true, time: true } },
            service: { select: { name: true, pricePence: true } },
          },
          orderBy: { slot: { time: "asc" } },
        }),

        // Total bookings ever (for the stats bar)
        db.booking.count({
          where: {
            slot: { shopId: session.shopId },
            status: "confirmed",
          },
        }),

        // How many free slots are left today
        db.slot.count({
          where: {
            shopId: session.shopId,
            date: today,
            isBooked: false,
          },
        }),
      ]);

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    return NextResponse.json({
      shop,
      todayBookings,
      stats: {
        todayCount: todayBookings.length,
        totalBookings,
        availableSlots,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}