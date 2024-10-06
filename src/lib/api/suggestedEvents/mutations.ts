import { getUserAuth } from "@/lib/auth/utils";
import { db } from "@/lib/db/index";
import { savedEvents } from "@/lib/db/schema";
import {
	type NewSuggestedEventParams,
	type SuggestedEventId,
	type UpdateSuggestedEventParams,
	insertSuggestedEventSchema,
	suggestedEventIdSchema,
	suggestedEvents,
	updateSuggestedEventSchema,
} from "@/lib/db/schema/suggestedEvents";
import { nanoid } from "@/lib/utils";
import { eq } from "drizzle-orm";

export const createSuggestedEvent = async (
	suggestedEvent: NewSuggestedEventParams,
) => {
	const newSuggestedEvent = insertSuggestedEventSchema.parse(suggestedEvent);
	try {
		const [s] = await db
			.insert(suggestedEvents)
			.values(newSuggestedEvent)
			.returning();
		return { suggestedEvent: s };
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
		const [s] = await db
			.update(suggestedEvents)
			.set({ ...newSuggestedEvent, updatedAt: new Date() })
			.where(eq(suggestedEvents.id, suggestedEventId!))
			.returning();
		return { suggestedEvent: s };
	} catch (err) {
		const message = (err as Error).message ?? "Error, please try again";
		console.error(message);
		throw { error: message };
	}
};

export const deleteSuggestedEvent = async (id: SuggestedEventId) => {
	const { id: suggestedEventId } = suggestedEventIdSchema.parse({ id });
	try {
		const [s] = await db
			.delete(suggestedEvents)
			.where(eq(suggestedEvents.id, suggestedEventId!))
			.returning();
		return { suggestedEvent: s };
	} catch (err) {
		const message = (err as Error).message ?? "Error, please try again";
		console.error(message);
		throw { error: message };
	}
};

export const acceptSuggestedEvent = async (id: SuggestedEventId) => {
	const { session } = await getUserAuth();
	const { id: suggestedEventId } = suggestedEventIdSchema.parse({ id });
	try {
		const [s] = await db
			.update(suggestedEvents)
			.set({ status: "approved" })
			.where(eq(suggestedEvents.id, suggestedEventId));
		const newSuggestedEvent = await db.query.suggestedEvents.findFirst({
			where: eq(suggestedEvents.id, suggestedEventId),
		});
		if (!newSuggestedEvent) {
			throw new Error("Suggested event not found");
		}
		const [savedEvent] = await db
			.insert(savedEvents)
			.values({
				...newSuggestedEvent,
				id: nanoid(),
				userId: session?.user.id!,
				suggestedEventId,
			})
			.returning();

		return { suggestedEvent: s, savedEvent };
	} catch (err) {
		const message = (err as Error).message ?? "Error, please try again";
		console.error(message);
		throw { error: message };
	}
};

export const rejectSuggestedEvent = async (id: SuggestedEventId) => {
	const { id: suggestedEventId } = suggestedEventIdSchema.parse({ id });
	try {
		const [s] = await db
			.update(suggestedEvents)
			.set({ status: "rejected" })
			.where(eq(suggestedEvents.id, suggestedEventId))
			.returning();
		return { suggestedEvent: s };
	} catch (err) {
		const message = (err as Error).message ?? "Error, please try again";
		console.error(message);
		throw { error: message };
	}
};
