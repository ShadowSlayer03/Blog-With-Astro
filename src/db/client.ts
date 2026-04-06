import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";
import "dotenv/config";

if(!process.env.TURSO_DB_URL || !process.env.TURSO_AUTH_TOKEN) {
    throw new Error("TURSO_DB_URL and TURSO_AUTH_TOKEN must be set in environment variables.");
}

const turso = createClient({
  url: process.env.TURSO_DB_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(turso);