ALTER TABLE "roster_entry" ADD COLUMN "directory_opt_out" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "roster_entry" ADD COLUMN "published_at" timestamp with time zone;