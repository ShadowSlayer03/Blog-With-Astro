/**
 * Shim for `cloudflare:workers` in dev envs.
 * In development (Node adapter) this maps `env` to `process.env` so that
 * middleware and db/client work without modification.
 */
export const env = {
  API_KEY: process.env.API_KEY ?? import.meta.env.API_KEY,
  TURSO_DB_URL: process.env.TURSO_DB_URL ?? import.meta.env.TURSO_DB_URL,
  TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ?? import.meta.env.TURSO_AUTH_TOKEN,
} as {
  API_KEY?: string;
  TURSO_DB_URL?: string;
  TURSO_AUTH_TOKEN?: string;
}