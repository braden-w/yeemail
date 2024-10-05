ALTER TABLE "user" ALTER COLUMN "hashed_password" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "google_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_google_id_unique" UNIQUE("google_id");