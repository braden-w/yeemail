import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import type { getEmails } from "@/lib/api/emails/queries";

import { nanoid, timestamps } from "@/lib/utils";

export const emails = pgTable("emails", {
	id: varchar("id", { length: 191 })
		.primaryKey()
		.$defaultFn(() => nanoid()),
	subject: text("subject").notNull(),
	content: text("content").notNull(),
	sender: text("sender").notNull(),
	receivedAt: timestamp("received_at").notNull(),
	links: text("links").notNull(),
	userId: varchar("user_id", { length: 256 }).notNull(),

	createdAt: timestamp("created_at").notNull().default(sql`now()`),
	updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Schema for emails - used to validate API requests
const baseSchema = createSelectSchema(emails).omit(timestamps);

export const insertEmailSchema = createInsertSchema(emails).omit(timestamps);
export const insertEmailParams = baseSchema
	.extend({
		receivedAt: z.coerce.string().min(1),
	})
	.omit({
		id: true,
		userId: true,
	});

export const updateEmailSchema = baseSchema;
export const updateEmailParams = baseSchema
	.extend({
		receivedAt: z.coerce.string().min(1),
	})
	.omit({
		userId: true,
	});
export const emailIdSchema = baseSchema.pick({ id: true });

// Types for emails - used to type API request params and within Components
export type Email = typeof emails.$inferSelect;
export type NewEmail = z.infer<typeof insertEmailSchema>;
export type NewEmailParams = z.infer<typeof insertEmailParams>;
export type UpdateEmailParams = z.infer<typeof updateEmailParams>;
export type EmailId = z.infer<typeof emailIdSchema>["id"];

// this type infers the return from getEmails() - meaning it will include any joins
export type CompleteEmail = Awaited<
	ReturnType<typeof getEmails>
>["emails"][number];
