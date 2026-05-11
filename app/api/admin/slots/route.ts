// app/api/admin/slots/route.ts
// GET  — returns slots for a date
// POST — generates slots for a date from a time range

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const date = request.nextUrl.searchParams.get("date");
  if (!date) return NextResponse.json({ error: "Date required" }, { status: 400 });

  const slots = await db.slot.findMany({
    where: { shopId: session.shopId, date },
    orderBy: { time: "asc" },
    select: { id: true, date: true, time: true, isBooked: true },
  });

  return NextResponse.json({ slots });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { date, startTime, endTime, intervalMinutes } = await request.json();

  if (!date || !startTime || !endTime || !intervalMinutes) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  // Build list of time strings between start and end
  const slots: { shopId: string; date: string; time: string }[] = [];

  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  let current    = sh * 60 + sm;
  const end      = eh * 60 + em;

  while (current + intervalMinutes <= end) {
    const hh  = String(Math.floor(current / 60)).padStart(2, "0");
    const mm  = String(current % 60).padStart(2, "0");
    slots.push({ shopId: session.shopId, date, time: `${hh}:${mm}` });
    current += intervalMinutes;
  }

  if (slots.length === 0) {
    return NextResponse.json(
      { error: "No slots could be created — check your start/end times" },
      { status: 400 }
    );
  }

  // skipDuplicates means re-running won't create doubles
  const result = await db.slot.createMany({ data: slots, skipDuplicates: true });

  return NextResponse.json({ created: result.count });
}