ALTER TABLE
  "saved_events"
ALTER COLUMN
  "title"
SET
  NOT NULL;

--> statement-breakpoint
ALTER TABLE
  "saved_events"
ALTER COLUMN
  "description"
SET
  NOT NULL;

--> statement-breakpoint
ALTER TABLE
  "saved_events"
ADD
  COLUMN "start" timestamp NOT NULL;

--> statement-breakpoint
ALTER TABLE
  "saved_events"
ADD
  COLUMN "end" timestamp;

--> statement-breakpoint
ALTER TABLE
  "saved_events"
ADD
  COLUMN "location" text;

--> statement-breakpoint
ALTER TABLE
  "saved_events"
ADD
  COLUMN "registration_link" text;

--> statement-breakpoint
ALTER TABLE
  "saved_events"
ADD
  COLUMN "associated_organization" text;

--> statement-breakpoint
ALTER TABLE
  "saved_events"
ADD
  COLUMN "user_id" varchar(256) NOT NULL;