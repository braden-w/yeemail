import { db } from "@/lib/db/index";
import {
	type NewSuggestedEventParams,
	type SuggestedEventId,
	type UpdateSuggestedEventParams,
	insertSuggestedEventSchema,
	suggestedEventIdSchema,
	suggestedEvents,
	updateSuggestedEventSchema,
} from "@/lib/db/schema/suggestedEvents";
import { eq } from "drizzle-orm";

export const createSuggestedEvent = async (
	suggestedEvent: NewSuggestedEventParams,
) => {
	const newSuggestedEvent = insertSuggestedEventSchema.parse(suggestedEvent);
	try {
		const [r] = await db
			.insert(suggestedEvents)
			.values(newSuggestedEvent)
			.returning();
		return { suggestedEvent: r };
	} catch (err) {
		const message = (err as Error).message ?? "Error, please try again";
		console.error(message);
		throw { error: message };
	}
};

export const updateSuggestedEvent = async (
	id: SuggestedEventId,
	suggestedEvent: UpdateSuggestedEventParams,
) => {
	const { id: suggestedEventId } = suggestedEventIdSchema.parse({ id });
	const newSuggestedEvent = updateSuggestedEventSchema.parse(suggestedEvent);
	try {
		const [r] = await db
			.update(suggestedEvents)
			.set({ ...newSuggestedEvent, updatedAt: new Date() })
			.where(eq(suggestedEvents.id, suggestedEventId!))
			.returning();
		return { suggestedEvent: r };
	} catch (err) {
		const message = (err as Error).message ?? "Error, please try again";
		console.error(message);
		throw { error: message };
	}
};

export const deleteSuggestedEvent = async (id: SuggestedEventId) => {
	const { id: suggestedEventId } = suggestedEventIdSchema.parse({ id });
	try {
		const [r] = await db
			.delete(suggestedEvents)
			.where(eq(suggestedEvents.id, suggestedEventId!))
			.returning();
		return { suggestedEvent: r };
	} catch (err) {
		const message = (err as Error).message ?? "Error, please try again";
		console.error(message);
		throw { error: message };
	}
};
