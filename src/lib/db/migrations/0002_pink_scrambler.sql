CREATE TABLE IF NOT EXISTS "emails" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"subject" text NOT NULL,
	"content" text NOT NULL,
	"sender" text NOT NULL,
	"date" text NOT NULL,
	"user_id" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
