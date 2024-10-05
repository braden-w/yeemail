ALTER TABLE "session" ADD COLUMN "google_access_token" text NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "google_refresh_token" text;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "google_access_token_expires_at" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "google_id_token" text NOT NULL;