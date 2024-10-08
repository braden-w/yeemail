import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";

export const users = pgTable("user", {
	id: text("id").primaryKey(),
	email: text("email").notNull().unique(),
	hashedPassword: text("hashed_password"),
	name: text("name"),
	google_id: text("google_id").unique().notNull(),
});

export const sessions = pgTable("session", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date",
	}).notNull(),
	google_access_token: text("google_access_token").notNull(),
	google_refresh_token: text("google_refresh_token"),
	google_access_token_expires_at: timestamp("google_access_token_expires_at", {
		withTimezone: true,
		mode: "date",
	}).notNull(),
	google_id_token: text("google_id_token").notNull(),
});

export const authenticationSchema = z.object({
	email: z.string().email().min(5).max(64),
	password: z
		.string()
		.min(4, { message: "must be at least 4 characters long" })
		.max(15, { message: "cannot be more than 15 characters long" }),
});

export const updateUserSchema = z.object({
	name: z.string().min(3).optional(),
	email: z.string().min(4).optional(),
});

export type UsernameAndPassword = z.infer<typeof authenticationSchema>;
