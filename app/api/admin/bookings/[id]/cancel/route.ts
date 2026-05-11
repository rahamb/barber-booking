// app/api/admin/bookings/[id]/cancel/route.ts
// Cancels a booking AND frees up the slot so customers can book it again

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // First check this booking belongs to this admin's shop
    const booking = await db.booking.findUnique({
      where: { id },
      include: { slot: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.slot.shopId !== session.shopId) {
      return NextResponse.json({ error: "Not authorised" }, { status: 403 });
    }

    // Cancel booking AND free up the slot — both or neither
    await db.$transaction([
      db.booking.update({
        where: { id },
        data: { status: "cancelled" },
      }),
      db.slot.update({
        where: { id: booking.slotId },
        data: { isBooked: false },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel error:", error);
    return NextResponse.json({ error: "Cancel failed" }, { status: 500 });
  }
}