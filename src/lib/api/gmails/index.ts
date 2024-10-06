import { getUserAuth } from "@/lib/auth/utils";
import { db } from "@/lib/db";
import { type NewEmail, emails, suggestedEvents } from "@/lib/db/schema";
import { extractEventsFromEmail } from "./extractEventsFromEmail";
import { getGmailsAfterDate } from "./getGmailsAfterDate";

export async function processGmailsAfterDate({
	token,
	maxResults = 75,
	date,
}: {
	token: string;
	maxResults?: number;
	date: Date;
}) {
	const { session } = await getUserAuth();
	const gmails = await getGmailsAfterDate({ token, maxResults, date });
	const newEmails: NewEmail[] = gmails.map((email) => ({
		...email,
		userId: session?.user?.id!,
		receivedAt: new Date(email.receivedAt),
	}));
	const insertedEmails = await db.insert(emails).values(newEmails).returning();
	const extractedEvents = (
		await Promise.all(newEmails.map(extractEventsFromEmail))
	).flat();
	const insertedEvents = await db
		.insert(suggestedEvents)
		.values(extractedEvents)
		.returning();
	return { emails: insertedEmails, events: insertedEvents };
}
