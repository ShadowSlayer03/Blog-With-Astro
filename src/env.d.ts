/// <reference types="astro/client" />

declare module "cloudflare:workers" {
  export const env: {
    API_KEY?: string;
    TURSO_DB_URL?: string;
    TURSO_AUTH_TOKEN?: string;
  };
}

declare module '*.wasm' {
  const content: WebAssembly.Module;
  export default content;
}

interface ImportMetaEnv {
  readonly TURSO_DB_URL: string;
  readonly TURSO_AUTH_TOKEN: string;
  readonly API_KEY: string;
  readonly PUBLIC_AUTHOR_DP: string;
  readonly API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}