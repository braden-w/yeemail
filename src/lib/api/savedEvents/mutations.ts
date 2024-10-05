import { db } from "@/lib/db/index";
import { eq } from "drizzle-orm";
import {
	SavedEventId,
	NewSavedEventParams,
	UpdateSavedEventParams,
	updateSavedEventSchema,
	insertSavedEventSchema,
	savedEvents,
	savedEventIdSchema,
} from "@/lib/db/schema/savedEvents";

export const createSavedEvent = async (savedEvent: NewSavedEventParams) => {
	const newSavedEvent = insertSavedEventSchema.parse(savedEvent);
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
	const { id: savedEventId } = savedEventIdSchema.parse({ id });
	const newSavedEvent = updateSavedEventSchema.parse(savedEvent);
	try {
		const [s] = await db
			.update(savedEvents)
			.set({ ...newSavedEvent, updatedAt: new Date() })
			.where(eq(savedEvents.id, savedEventId!))
			.returning();
		return { savedEvent: s };
	} catch (err) {
		const message = (err as Error).message ?? "Error, please try again";
		console.error(message);
		throw { error: message };
	}
};

export const deleteSavedEvent = async (id: SavedEventId) => {
	const { id: savedEventId } = savedEventIdSchema.parse({ id });
	try {
		const [s] = await db
			.delete(savedEvents)
			.where(eq(savedEvents.id, savedEventId!))
			.returning();
		return { savedEvent: s };
	} catch (err) {
		const message = (err as Error).message ?? "Error, please try again";
		console.error(message);
		throw { error: message };
	}
};
