import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";
import { env } from "cloudflare:workers";

const isProduction = process.env.NODE_ENV === 'production';

const url = isProduction ? env.TURSO_DB_URL : import.meta.env.TURSO_DB_URL;
const authToken = isProduction ? env.TURSO_AUTH_TOKEN : import.meta.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
    throw new Error("TURSO_DB_URL and TURSO_AUTH_TOKEN must be set in environment variables.");
}

const turso = createClient({
  url,
  authToken,
});

export const db = drizzle(turso);