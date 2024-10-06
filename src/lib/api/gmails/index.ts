import { getUserAuth } from "@/lib/auth/utils";
import { db } from "@/lib/db";
import { type NewEmail, emails, suggestedEvents } from "@/lib/db/schema";
import { Effect } from "effect";
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
		await Effect.all(
			newEmails.map((email) =>
				Effect.tryPromise(() => extractEventsFromEmail(email)),
			),
			{ concurrency: 10 },
		).pipe(Effect.runPromise)
	).flat();
	const insertedEvents = await db
		.insert(suggestedEvents)
		.values(extractedEvents)
		.returning();
	return { emails: insertedEmails, events: insertedEvents };
}
