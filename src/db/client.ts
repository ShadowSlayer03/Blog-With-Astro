import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/http";
import { env } from "cloudflare:workers";

// In Cloudflare Workers, use runtime bindings/secrets.
// In local dev (Node adapter), the 'cloudflare:workers' module is shimmed
// to process.env via astro.config.mjs, so env.* works there too.
const url = env.TURSO_DB_URL || import.meta.env.TURSO_DB_URL;
const authToken = env.TURSO_AUTH_TOKEN || import.meta.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
    throw new Error("TURSO_DB_URL and TURSO_AUTH_TOKEN must be set in environment variables.");
}

const turso = createClient({
  url,
  authToken,
});

export const db = drizzle(turso);
