import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { requireSettings } from "@/lib/config";

const globalDb = globalThis as unknown as { pactDb?: PrismaClient };

export function getDatabase() {
  requireSettings(["DATABASE_URL"]);
  if (!globalDb.pactDb) {
    globalDb.pactDb = new PrismaClient({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    });
  }
  return globalDb.pactDb;
}
