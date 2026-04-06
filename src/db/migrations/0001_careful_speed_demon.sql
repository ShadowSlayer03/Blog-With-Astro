DROP INDEX "likes_post_slug_unique";--> statement-breakpoint
DROP INDEX "subscribers_email_unique";--> statement-breakpoint
DROP INDEX "views_post_slug_unique";--> statement-breakpoint
ALTER TABLE `likes` ALTER COLUMN "count" TO "count" integer NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `likes_post_slug_unique` ON `likes` (`post_slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `subscribers_email_unique` ON `subscribers` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `views_post_slug_unique` ON `views` (`post_slug`);--> statement-breakpoint
ALTER TABLE `likes` ALTER COLUMN "count" TO "count" integer NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `views` ALTER COLUMN "count" TO "count" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `views` ALTER COLUMN "count" TO "count" integer NOT NULL DEFAULT 0;