// lib/db.ts
// This is the ONE place in the whole app that connects to the database.
// Every other file imports { db } from "@/lib/db"

import { PrismaClient } from "@prisma/client";

// This trick prevents too many connections in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"], // Only log errors, not every query
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}