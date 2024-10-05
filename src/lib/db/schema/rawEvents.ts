import { sql } from "drizzle-orm";
import { timestamp, text, varchar, pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import type { getRawEvents } from "@/lib/api/rawEvents/queries";

import { nanoid, timestamps } from "@/lib/utils";

export const rawEvents = pgTable("raw_events", {
	id: varchar("id", { length: 191 })
		.primaryKey()
		.$defaultFn(() => nanoid()),
	title: text("title").notNull(),
	description: text("description").notNull(),
	start: timestamp("start").notNull(),
	end: timestamp("end").notNull(),
	location: text("location").notNull(),

	createdAt: timestamp("created_at").notNull().default(sql`now()`),
	updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Schema for rawEvents - used to validate API requests
const baseSchema = createSelectSchema(rawEvents).omit(timestamps);

export const insertRawEventSchema =
	createInsertSchema(rawEvents).omit(timestamps);
export const insertRawEventParams = baseSchema
	.extend({
		start: z.coerce.string().min(1),
		end: z.coerce.string().min(1),
	})
	.omit({
		id: true,
	});

export const updateRawEventSchema = baseSchema;
export const updateRawEventParams = baseSchema.extend({
	start: z.coerce.string().min(1),
	end: z.coerce.string().min(1),
});
export const rawEventIdSchema = baseSchema.pick({ id: true });

// Types for rawEvents - used to type API request params and within Components
export type RawEvent = typeof rawEvents.$inferSelect;
export type NewRawEvent = z.infer<typeof insertRawEventSchema>;
export type NewRawEventParams = z.infer<typeof insertRawEventParams>;
export type UpdateRawEventParams = z.infer<typeof updateRawEventParams>;
export type RawEventId = z.infer<typeof rawEventIdSchema>["id"];

// this type infers the return from getRawEvents() - meaning it will include any joins
export type CompleteRawEvent = Awaited<
	ReturnType<typeof getRawEvents>
>["rawEvents"][number];
