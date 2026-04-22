declare module "cloudflare:workers" {
  export const env: {
    API_KEY?: string;
    TURSO_DB_URL?: string;
    TURSO_AUTH_TOKEN?: string;
  };
}