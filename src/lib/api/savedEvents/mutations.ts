import { getUserAuth } from "@/lib/auth/utils";
import { db } from "@/lib/db/index";
import {
	type NewSavedEventParams,
	type SavedEvent,
	type SavedEventId,
	type UpdateSavedEventParams,
	insertSavedEventSchema,
	savedEventIdSchema,
	savedEvents,
	updateSavedEventSchema,
} from "@/lib/db/schema/savedEvents";
import { and, eq, inArray } from "drizzle-orm";
import { google } from "googleapis";
import { z } from "zod";

export const createSavedEvent = async (savedEvent: NewSavedEventParams) => {
	const { session } = await getUserAuth();
	const newSavedEvent = insertSavedEventSchema.parse({
		...savedEvent,
		userId: session?.user.id!,
	});
	try {
		const [s] = await db.insert(savedEvents).values(newSavedEvent).returning();
		return { savedEvent: s };
	} catch (err) {
		const message = (err as Error).message ?? "Error, please try again";
		console.error(message);
		throw { error: message };
	}
};

export const updateSavedEvent = async (
	id: SavedEventId,
	savedEvent: UpdateSavedEventParams,
) => {
	const { session } = await getUserAuth();
	const { id: savedEventId } = savedEventIdSchema.parse({ id });
	const newSavedEvent = updateSavedEventSchema.parse({
		...savedEvent,
		userId: session?.user.id!,
	});
	try {
		const [s] = await db
			.update(savedEvents)
			.set({ ...newSavedEvent, updatedAt: new Date() })
			.where(
				and(
					eq(savedEvents.id, savedEventId!),
					eq(savedEvents.userId, session?.user.id!),
				),
			)
			.returning();
		return { savedEvent: s };
	} catch (err) {
		const message = (err as Error).message ?? "Error, please try again";
		console.error(message);
		throw { error: message };
	}
};

export const deleteSavedEvent = async (id: SavedEventId) => {
	const { session } = await getUserAuth();
	const { id: savedEventId } = savedEventIdSchema.parse({ id });
	try {
		const [s] = await db
			.delete(savedEvents)
			.where(
				and(
					eq(savedEvents.id, savedEventId!),
					eq(savedEvents.userId, session?.user.id!),
				),
			)
			.returning();
		return { savedEvent: s };
	} catch (err) {
		const message = (err as Error).message ?? "Error, please try again";
		console.error(message);
		throw { error: message };
	}
};

export const bulkExportSavedEvents = async (ids: SavedEventId[]) => {
	const { session } = await getUserAuth();
	if (!session) {
		throw { error: "No user session found" };
	}
	try {
		const s = await db
			.select()
			.from(savedEvents)
			.where(inArray(savedEvents.id, ids));
		await addEventsToCalendar({
			userToken: session.user.googleAccessToken,
			events: s,
		});
		return { savedEvents: s };
	} catch (err) {
		const message = (err as Error).message ?? "Error, please try again";
		console.error(message);
		throw { error: message };
	}
};

async function addEventsToCalendar({
	userToken,
	events,
}: { userToken: string; events: SavedEvent[] }) {
	const oauth2Client = new google.auth.OAuth2();
	oauth2Client.setCredentials({ access_token: userToken });

	const calendar = google.calendar({ version: "v3", auth: oauth2Client });

	const createdEventsPromises = events.map(async (e) => {
		const event = {
			summary: e.title,
			location: e.location,
			description: e.description,
			start: { dateTime: e.start.toISOString() },
			end: {
				dateTime: (
					e.end ?? new Date(e.start.getTime() + 60 * 60 * 1000)
				).toISOString(),
			},
			status: "tentative",
			attendees: [{ email: "bmw02002turbo@gmail.com", self: true }],
		};

		try {
			const res = await calendar.events.insert({
				calendarId: "primary",
				requestBody: event,
			});
			const data = z
				.object({
					htmlLink: z.string(),
				})
				.parse(res.data);

			console.log("Potential event created:", data.htmlLink);
			return data;
		} catch (error) {
			console.error("Error creating event:", error);
			throw error;
		}
	});

	const createdEvents = await Promise.all(createdEventsPromises);
	return createdEvents;
}
