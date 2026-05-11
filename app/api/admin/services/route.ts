// app/api/admin/services/route.ts — GET and POST

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const services = await db.service.findMany({
    where: { shopId: session.shopId },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ services });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { name, pricePence, durationMin } = await request.json();

  if (!name || !pricePence || !durationMin) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  const service = await db.service.create({
    data: { shopId: session.shopId, name, pricePence, durationMin },
  });

  return NextResponse.json({ service }, { status: 201 });
}