// app/api/admin/bookings/[id]/complete/route.ts
// Marks a booking as completed — used after the appointment is done

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

  await db.booking.update({
    where: { id },
    data: { status: "completed" },
  });

  return NextResponse.json({ success: true });
}