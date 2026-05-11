// app/api/admin/services/[id]/route.ts — DELETE

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { id } = await params;
  const service = await db.service.findUnique({ where: { id } });

  if (!service || service.shopId !== session.shopId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.service.delete({ where: { id } });
  return NextResponse.json({ success: true });
}