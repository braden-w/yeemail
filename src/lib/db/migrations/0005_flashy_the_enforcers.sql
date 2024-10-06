ALTER TABLE "saved_events" RENAME COLUMN "raw_event_id" TO "suggested_event_id";--> statement-breakpoint
ALTER TABLE "saved_events" DROP CONSTRAINT "saved_events_raw_event_id_suggested_events_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "saved_events" ADD CONSTRAINT "saved_events_suggested_event_id_suggested_events_id_fk" FOREIGN KEY ("suggested_event_id") REFERENCES "public"."suggested_events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
