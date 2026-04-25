import { drizzle } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client/http"
import * as schema from "./schema"

type Env = {
  TURSO_DB_URL: string
  TURSO_AUTH_TOKEN: string
}

export function getDb(locals: App.Locals) {
  const env: Env = (locals as any)?.runtime?.env ?? {
    TURSO_DB_URL: import.meta.env.TURSO_DB_URL,
    TURSO_AUTH_TOKEN: import.meta.env.TURSO_AUTH_TOKEN,
  }

  if (!env.TURSO_DB_URL || !env.TURSO_AUTH_TOKEN) {
    throw new Error("TURSO_DB_URL and TURSO_AUTH_TOKEN must be set")
  }

  const turso = createClient({
    url: env.TURSO_DB_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  })

  return drizzle(turso, { schema })
}