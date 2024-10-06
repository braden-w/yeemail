ALTER TABLE "suggested_events" ALTER COLUMN "location" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "suggested_events" ADD COLUMN "associated_organization" text;