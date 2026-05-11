// app/api/admin/slots/[id]/route.ts
// DELETE — removes a single free slot

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { id } = await params;

  const slot = await db.slot.findUnique({ where: { id } });

  if (!slot) {
    return NextResponse.json({ error: "Slot not found" }, { status: 404 });
  }
  if (slot.shopId !== session.shopId) {
    return NextResponse.json({ error: "Not authorised" }, { status: 403 });
  }
  if (slot.isBooked) {
    return NextResponse.json(
      { error: "Cannot delete a booked slot — cancel the booking first" },
      { status: 400 }
    );
  }

  await db.slot.delete({ where: { id } });
  return NextResponse.json({ success: true });
}