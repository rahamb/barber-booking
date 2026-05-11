// prisma/seed.ts
// Run with: npx ts-node prisma/seed.ts
// This fills your database with sample data for testing

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create two sample shops
  const shop1 = await db.shop.create({
    data: {
      name: "Sharp Cuts Barber",
      type: "barber",
      address: "42 High Street",
      postcode: "M1 1AA",
      city: "Manchester",
      phone: "0161 234 5678",
    },
  });

  const shop2 = await db.shop.create({
    data: {
      name: "Glow Beauty Parlour",
      type: "beauty",
      address: "18 Market Square",
      postcode: "M2 3BB",
      city: "Manchester",
      phone: "0161 987 6543",
    },
  });

  // Add services to shop1
  const service1 = await db.service.create({
    data: {
      shopId: shop1.id,
      name: "Classic Haircut",
      pricePence: 1500, // £15.00
      durationMin: 30,
    },
  });

  await db.service.create({
    data: {
      shopId: shop1.id,
      name: "Skin Fade",
      pricePence: 1800, // £18.00
      durationMin: 45,
    },
  });

  await db.service.create({
    data: {
      shopId: shop1.id,
      name: "Beard Trim",
      pricePence: 800, // £8.00
      durationMin: 20,
    },
  });

  // Add services to shop2
  await db.service.create({
    data: {
      shopId: shop2.id,
      name: "Eyebrow Threading",
      pricePence: 1000,
      durationMin: 20,
    },
  });

  await db.service.create({
    data: {
      shopId: shop2.id,
      name: "Full Facial",
      pricePence: 3500,
      durationMin: 60,
    },
  });

  // Add time slots for tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split("T")[0]; // "2025-06-15"

  const times = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00"];

  for (const time of times) {
    await db.slot.create({
      data: { shopId: shop1.id, date: dateStr, time },
    });
    await db.slot.create({
      data: { shopId: shop2.id, date: dateStr, time },
    });
  }

  // Create an admin account for shop1
  const hash = await bcrypt.hash("admin123", 10);
  await db.admin.create({
    data: {
      email: "admin@sharpcuts.com",
      passwordHash: hash,
      shopId: shop1.id,
    },
  });

  console.log("✅ Done! Created:");
  console.log("   2 shops");
  console.log("   5 services");
  console.log(`   ${times.length * 2} slots for tomorrow (${dateStr})`);
  console.log("   1 admin: admin@sharpcuts.com / admin123");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());