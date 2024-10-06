import { getUserAuth } from "@/lib/auth/utils";
import { db } from "@/lib/db";
import {
	type NewEmail,
	type NewSuggestedEvent,
	emails,
	suggestedEvents,
} from "@/lib/db/schema";
import { extractEventsFromEmail } from "./extractEventsFromEmail";
import { getGmailsAfterDate } from "./getGmailsAfterDate";

export async function processGmailsAfterDate({
	token,
	maxResults = 5,
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
	// const extractedEvents: NewSuggestedEvent[] = [];
	const insertedEvents: NewSuggestedEvent[] = [];
	for (const email of newEmails) {
		const events = await extractEventsFromEmail(email);
		if (events.length === 0) {
			continue;
		}
		// extractedEvents.push(...events);
		const ie = await db.insert(suggestedEvents).values(events).returning();
		insertedEvents.push(...ie);
	}
	// const insertedEvents = await db
	// 	.insert(suggestedEvents)
	// 	.values(extractedEvents)
	// 	.returning();
	return { emails: insertedEmails, events: insertedEvents };
}
