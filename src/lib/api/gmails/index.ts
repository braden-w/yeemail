import { getUserAuth } from "@/lib/auth/utils";
import { db } from "@/lib/db";
import { type NewEmailParams, emails } from "@/lib/db/schema";
import { getGmailsAfterDate } from "./getGmailsAfterDate";

export async function processGmailsAfterDate({
	token,
	maxResults = 75,
	date,
}: {
	token: string;
	maxResults?: number;
	date: Date;
}): Promise<NewEmailParams[]> {
	const { session } = await getUserAuth();
	const gmails = await getGmailsAfterDate({ token, maxResults, date });
	const newEmails = gmails.map((email) => ({
		...email,
		userId: session?.user?.id!,
		receivedAt: new Date(email.receivedAt),
	}));
	const e = await db.insert(emails).values(newEmails).returning();
	return { gmails: e };
}
