ALTER TABLE
  "emails" RENAME COLUMN "date" TO "received_at";

--> statement-breakpoint
ALTER TABLE
  "emails"
ALTER COLUMN
  "received_at"
SET
  DATA TYPE timestamp USING received_at :: timestamp without time zone;

--> statement-breakpoint
ALTER TABLE
  "emails"
ALTER COLUMN
  "links"
SET
  DATA TYPE text;

--> statement-breakpoint
ALTER TABLE
  "emails"
ALTER COLUMN
  "links" DROP DEFAULT;