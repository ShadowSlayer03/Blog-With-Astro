import "dotenv/config";

import type { Config } from "drizzle-kit";

if(!process.env.TURSO_DB_URL || !process.env.TURSO_AUTH_TOKEN) {
    throw new Error("TURSO_DB_URL and TURSO_AUTH_TOKEN must be set in environment variables.");
}

export default {
    schema: "./src/db/schema.ts",
    out: "./src/db/migrations",
    dialect: "turso",
    dbCredentials: {
        url: process.env.TURSO_DB_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN,
    },
} satisfies Config;