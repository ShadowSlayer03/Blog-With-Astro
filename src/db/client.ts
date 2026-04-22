import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";
import { env } from "cloudflare:workers";

const url = env.TURSO_DB_URL ?? process.env.TURSO_DB_URL;
const authToken = env.TURSO_AUTH_TOKEN ?? process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
    throw new Error("TURSO_DB_URL and TURSO_AUTH_TOKEN must be set in environment variables.");
}

const turso = createClient({
  url,
  authToken,
});

export const db = drizzle(turso);