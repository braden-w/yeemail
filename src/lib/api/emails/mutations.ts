import { getUserAuth } from "@/lib/auth/utils";
import { db } from "@/lib/db/index";
import {
	type EmailId,
	type NewEmailParams,
	type UpdateEmailParams,
	emailIdSchema,
	emails,
	insertEmailSchema,
	updateEmailSchema,
} from "@/lib/db/schema/emails";
import { and, eq } from "drizzle-orm";

export const createEmail = async (email: NewEmailParams) => {
	const { session } = await getUserAuth();
	const newEmail = insertEmailSchema.parse({
		...email,
		userId: session?.user.id!,
	});
	try {
		const [e] = await db.insert(emails).values(newEmail).returning();
		return { email: e };
	} catch (err) {
		const message = (err as Error).message ?? "Error, please try again";
		console.error(message);
		throw { error: message };
	}
};

export const updateEmail = async (id: EmailId, email: UpdateEmailParams) => {
	const { session } = await getUserAuth();
	const { id: emailId } = emailIdSchema.parse({ id });
	const newEmail = updateEmailSchema.parse({
		...email,
		userId: session?.user.id!,
	});
	try {
		const [e] = await db
			.update(emails)
			.set({ ...newEmail, updatedAt: new Date() })
			.where(and(eq(emails.id, emailId!), eq(emails.userId, session?.user.id!)))
			.returning();
		return { email: e };
	} catch (err) {
		const message = (err as Error).message ?? "Error, please try again";
		console.error(message);
		throw { error: message };
	}
};

export const deleteEmail = async (id: EmailId) => {
	const { session } = await getUserAuth();
	const { id: emailId } = emailIdSchema.parse({ id });
	try {
		const [e] = await db
			.delete(emails)
			.where(and(eq(emails.id, emailId!), eq(emails.userId, session?.user.id!)))
			.returning();
		return { email: e };
	} catch (err) {
		const message = (err as Error).message ?? "Error, please try again";
		console.error(message);
		throw { error: message };
	}
};
