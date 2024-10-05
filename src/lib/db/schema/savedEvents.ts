import type { getSavedEvents } from "@/lib/api/savedEvents/queries";
import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { suggestedEvents } from "./suggestedEvents";

import { nanoid, timestamps } from "@/lib/utils";

export const savedEvents = pgTable("saved_events", {
	id: varchar("id", { length: 191 })
		.primaryKey()
		.$defaultFn(() => nanoid()),
	title: text("title"),
	description: text("description"),
	suggestedEventId: varchar("raw_event_id", { length: 256 })
		.references(() => suggestedEvents.id, { onDelete: "cascade" })
		.notNull(),

	createdAt: timestamp("created_at").notNull().default(sql`now()`),
	updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Schema for savedEvents - used to validate API requests
const baseSchema = createSelectSchema(savedEvents).omit(timestamps);

export const insertSavedEventSchema =
	createInsertSchema(savedEvents).omit(timestamps);
export const insertSavedEventParams = baseSchema
	.extend({
		suggestedEventId: z.coerce.string().min(1),
	})
	.omit({
		id: true,
	});

export const updateSavedEventSchema = baseSchema;
export const updateSavedEventParams = baseSchema.extend({
	suggestedEventId: z.coerce.string().min(1),
});
export const savedEventIdSchema = baseSchema.pick({ id: true });

// Types for savedEvents - used to type API request params and within Components
export type SavedEvent = typeof savedEvents.$inferSelect;
export type NewSavedEvent = z.infer<typeof insertSavedEventSchema>;
export type NewSavedEventParams = z.infer<typeof insertSavedEventParams>;
export type UpdateSavedEventParams = z.infer<typeof updateSavedEventParams>;
export type SavedEventId = z.infer<typeof savedEventIdSchema>["id"];

// this type infers the return from getSavedEvents() - meaning it will include any joins
export type CompleteSavedEvent = Awaited<
	ReturnType<typeof getSavedEvents>
>["savedEvents"][number];
