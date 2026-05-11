// app/api/bookings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const booking = await db.booking.findUnique({
      where: { id },
      include: {
        slot: true,
        service: { include: { shop: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load booking" }, { status: 500 });
  }
}