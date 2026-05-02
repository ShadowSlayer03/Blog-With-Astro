import { drizzle } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client/http"
import { env } from "cloudflare:workers"
import * as schema from "./schema"

export function getDb() {
  if (!env.TURSO_DB_URL || !env.TURSO_AUTH_TOKEN) {
    throw new Error("TURSO_DB_URL and TURSO_AUTH_TOKEN must be set")
  }

  const turso = createClient({
    url: env.TURSO_DB_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  });


  return drizzle(turso, { schema });
}