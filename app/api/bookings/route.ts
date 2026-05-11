// app/api/bookings/route.ts
// Creates a booking — marks the slot as taken, saves customer details
// Protected against double-booking using a database transaction

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { slotId, serviceId, customerName, customerEmail, customerPhone } = body;

  // Basic validation
  if (!slotId || !serviceId || !customerName || !customerEmail || !customerPhone) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  if (!customerEmail.includes("@")) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  try {
    // Use a transaction — both operations succeed or both fail
    // This prevents two people booking the same slot at the same time
    const booking = await db.$transaction(async (tx) => {

      // Check the slot is still free — inside the transaction
      const slot = await tx.slot.findUnique({
        where: { id: slotId },
      });

      if (!slot) throw new Error("SLOT_NOT_FOUND");
      if (slot.isBooked) throw new Error("SLOT_TAKEN");

      // Mark slot as booked
      await tx.slot.update({
        where: { id: slotId },
        data: { isBooked: true },
      });

      // Create the booking record
      return tx.booking.create({
        data: { slotId, serviceId, customerName, customerEmail, customerPhone },
        include: {
          slot: true,
          service: {
            include: { shop: true },
          },
        },
      });
    });

    return NextResponse.json({ booking }, { status: 201 });

  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "SLOT_TAKEN") {
        return NextResponse.json(
          { error: "Sorry, that slot was just taken. Please choose another time." },
          { status: 409 }
        );
      }
      if (error.message === "SLOT_NOT_FOUND") {
        return NextResponse.json({ error: "Slot not found" }, { status: 404 });
      }
    }
    console.error("Booking error:", error);
    return NextResponse.json({ error: "Booking failed. Please try again." }, { status: 500 });
  }
}