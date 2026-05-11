// app/api/shops/route.ts
// What it does: accepts a postcode or city, returns matching shops
// How to test: GET /api/shops?city=Manchester

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  // Read the search term from the URL
  // e.g. /api/shops?city=Manchester  OR  /api/shops?postcode=M1
  const { searchParams } = request.nextUrl;
  const city = searchParams.get("city");
  const postcode = searchParams.get("postcode");

  // Must provide at least one
  if (!city && !postcode) {
    return NextResponse.json(
      { error: "Please provide a city or postcode" },
      { status: 400 }
    );
  }

  try {
    const shops = await db.shop.findMany({
      where: {
        // Search by city OR postcode — whichever was provided
        OR: [
          city
            ? { city: { contains: city, mode: "insensitive" } }
            : {},
          postcode
            ? { postcode: { contains: postcode, mode: "insensitive" } }
            : {},
        ],
      },
      // Include count of available slots so we can show "8 slots available"
      include: {
        _count: {
          select: {
            slots: {
              where: { isBooked: false },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ shops });
  } catch (error) {
    console.error("Shop search error:", error);
    return NextResponse.json(
      { error: "Search failed. Please try again." },
      { status: 500 }
    );
  }
}