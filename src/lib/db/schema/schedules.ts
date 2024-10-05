import { sql } from "drizzle-orm";
import { text, varchar, timestamp, pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { type getSchedules } from "@/lib/api/schedules/queries";

import { nanoid, timestamps } from "@/lib/utils";

export const schedules = pgTable("schedules", {
	id: varchar("id", { length: 191 })
		.primaryKey()
		.$defaultFn(() => nanoid()),
	title: text("title").notNull(),
	userId: varchar("user_id", { length: 256 }).notNull(),

	createdAt: timestamp("created_at").notNull().default(sql`now()`),
	updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Schema for schedules - used to validate API requests
const baseSchema = createSelectSchema(schedules).omit(timestamps);

export const insertScheduleSchema =
	createInsertSchema(schedules).omit(timestamps);
export const insertScheduleParams = baseSchema.extend({}).omit({
	id: true,
	userId: true,
});

export const updateScheduleSchema = baseSchema;
export const updateScheduleParams = baseSchema.extend({}).omit({
	userId: true,
});
export const scheduleIdSchema = baseSchema.pick({ id: true });

// Types for schedules - used to type API request params and within Components
export type Schedule = typeof schedules.$inferSelect;
export type NewSchedule = z.infer<typeof insertScheduleSchema>;
export type NewScheduleParams = z.infer<typeof insertScheduleParams>;
export type UpdateScheduleParams = z.infer<typeof updateScheduleParams>;
export type ScheduleId = z.infer<typeof scheduleIdSchema>["id"];

// this type infers the return from getSchedules() - meaning it will include any joins
export type CompleteSchedule = Awaited<
	ReturnType<typeof getSchedules>
>["schedules"][number];
