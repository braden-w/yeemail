import { db } from "@/lib/db/index";
import { eq } from "drizzle-orm";
import {
	RawEventId,
	NewRawEventParams,
	UpdateRawEventParams,
	updateRawEventSchema,
	insertRawEventSchema,
	rawEvents,
	rawEventIdSchema,
} from "@/lib/db/schema/rawEvents";

export const createRawEvent = async (rawEvent: NewRawEventParams) => {
	const newRawEvent = insertRawEventSchema.parse(rawEvent);
	try {
		const [r] = await db.insert(rawEvents).values(newRawEvent).returning();
		return { rawEvent: r };
	} catch (err) {
		const message = (err as Error).message ?? "Error, please try again";
		console.error(message);
		throw { error: message };
	}
};

export const updateRawEvent = async (
	id: RawEventId,
	rawEvent: UpdateRawEventParams,
) => {
	const { id: rawEventId } = rawEventIdSchema.parse({ id });
	const newRawEvent = updateRawEventSchema.parse(rawEvent);
	try {
		const [r] = await db
			.update(rawEvents)
			.set({ ...newRawEvent, updatedAt: new Date() })
			.where(eq(rawEvents.id, rawEventId!))
			.returning();
		return { rawEvent: r };
	} catch (err) {
		const message = (err as Error).message ?? "Error, please try again";
		console.error(message);
		throw { error: message };
	}
};

export const deleteRawEvent = async (id: RawEventId) => {
	const { id: rawEventId } = rawEventIdSchema.parse({ id });
	try {
		const [r] = await db
			.delete(rawEvents)
			.where(eq(rawEvents.id, rawEventId!))
			.returning();
		return { rawEvent: r };
	} catch (err) {
		const message = (err as Error).message ?? "Error, please try again";
		console.error(message);
		throw { error: message };
	}
};
