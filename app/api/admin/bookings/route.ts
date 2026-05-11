// app/api/admin/bookings/route.ts
// Returns all bookings for this shop, optionally filtered by date
// GET /api/admin/bookings           → all bookings
// GET /api/admin/bookings?date=2025-06-15  → that day only

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const date = request.nextUrl.searchParams.get("date");

  try {
    const bookings = await db.booking.findMany({
      where: {
        slot: {
          shopId: session.shopId,
          // If a date was provided, filter by it
          ...(date && { date }),
        },
      },
      include: {
        slot: {
          select: { date: true, time: true },
        },
        service: {
          select: { name: true, pricePence: true },
        },
      },
      orderBy: [
        { slot: { date: "desc" } },
        { slot: { time: "asc"  } },
      ],
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Bookings list error:", error);
    return NextResponse.json(
      { error: "Failed to load bookings" },
      { status: 500 }
    );
  }
}