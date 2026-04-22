/**
 * Shim for `cloudflare:workers` in dev envs.
 * In development (Node adapter) this maps `env` to `process.env` so that
 * middleware and db/client work without modification.
 */
export const env = process.env as unknown as {
  API_KEY?: string;
  TURSO_DB_URL?: string;
  TURSO_AUTH_TOKEN?: string;
};
