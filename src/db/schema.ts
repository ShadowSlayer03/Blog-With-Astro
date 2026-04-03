import { sql } from "drizzle-orm";
import { text, sqliteTable } from "drizzle-orm/sqlite-core";

export const likes = sqliteTable("likes", {
    id: text("id").primaryKey(),
    post_slug: text("post_slug").unique().notNull(),
    count: text("count").notNull().default("0"),
    created_at: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updated_at: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const views = sqliteTable("views", {
    id: text("id").primaryKey(),
    post_slug: text("post_slug").unique().notNull(),
    count: text("count").notNull().default("0"),
    created_at: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updated_at: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const subscribers = sqliteTable("subscribers", {
    id: text("id").primaryKey(),
    email: text("email").unique().notNull(),
    created_at: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    unsubscribed_at: text("unsubscribed_at"),
});