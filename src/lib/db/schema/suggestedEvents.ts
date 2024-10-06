import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import type { getSuggestedEvents } from "@/lib/api/suggestedEvents/queries";

import { nanoid, timestamps } from "@/lib/utils";

export const suggestedEvents = pgTable("suggested_events", {
	id: varchar("id", { length: 191 })
		.primaryKey()
		.$defaultFn(() => nanoid()),
	title: text("title").notNull(),
	description: text("description").notNull(),
	start: timestamp("start").notNull(),
	end: timestamp("end"),
	location: text("location"),
	registrationLink: text("registration_link"),
	associatedOrganization: text("associated_organization"),

	status: text("status", { enum: ["pending", "approved", "rejected"] })
		.notNull()
		.default("pending"),

	createdAt: timestamp("created_at").notNull().default(sql`now()`),
	updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Schema for suggestedEvents - used to validate API requests
const baseSchema = createSelectSchema(suggestedEvents).omit(timestamps);

export const insertSuggestedEventSchema =
	createInsertSchema(suggestedEvents).omit(timestamps);
export const insertSuggestedEventParams = baseSchema
	.extend({
		start: z.coerce.string().min(1),
		end: z.coerce.string().min(1),
	})
	.omit({
		id: true,
	});

export const updateSuggestedEventSchema = baseSchema;
export const updateSuggestedEventParams = baseSchema.extend({
	start: z.coerce.string().min(1),
	end: z.coerce.string().min(1),
});
export const suggestedEventIdSchema = baseSchema.pick({ id: true });

// Types for suggestedEvents - used to type API request params and within Components
export type SuggestedEvent = typeof suggestedEvents.$inferSelect;
export type NewSuggestedEvent = z.infer<typeof insertSuggestedEventSchema>;
export type NewSuggestedEventParams = z.infer<
	typeof insertSuggestedEventParams
>;
export type UpdateSuggestedEventParams = z.infer<
	typeof updateSuggestedEventParams
>;
export type SuggestedEventId = z.infer<typeof suggestedEventIdSchema>["id"];

// this type infers the return from getSuggestedEvents() - meaning it will include any joins
export type CompleteSuggestedEvent = Awaited<
	ReturnType<typeof getSuggestedEvents>
>["suggestedEvents"][number];
