import { db } from "@/lib/db/index";
import { eq, and } from "drizzle-orm";
import { getUserAuth } from "@/lib/auth/utils";
import { type EmailId, emailIdSchema, emails } from "@/lib/db/schema/emails";

export const getEmails = async () => {
	const { session } = await getUserAuth();
	const rows = await db
		.select()
		.from(emails)
		.where(eq(emails.userId, session?.user.id!));
	const e = rows;
	return { emails: e };
};

export const getEmailById = async (id: EmailId) => {
	const { session } = await getUserAuth();
	const { id: emailId } = emailIdSchema.parse({ id });
	const [row] = await db
		.select()
		.from(emails)
		.where(and(eq(emails.id, emailId), eq(emails.userId, session?.user.id!)));
	if (row === undefined) return {};
	const e = row;
	return { email: e };
};
