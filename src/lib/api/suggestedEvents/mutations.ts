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
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

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
		const result = await db.transaction(async (tx) => {
			await tx
				.update(suggestedEvents)
				.set({ status: "approved" })
				.where(eq(suggestedEvents.id, suggestedEventId));

			const [updatedSuggestedEvent] = await tx
				.select()
				.from(suggestedEvents)
				.where(eq(suggestedEvents.id, suggestedEventId));

			if (!updatedSuggestedEvent) {
				throw new Error("Suggested event not found");
			}

			const [savedEvent] = await tx
				.insert(savedEvents)
				.values({
					...updatedSuggestedEvent,
					id: nanoid(),
					userId: session?.user.id!,
					suggestedEventId,
				})
				.returning();

			return { suggestedEvent: updatedSuggestedEvent, savedEvent };
		});

		return result;
	} catch (err) {
		const message = (err as Error).message ?? "Error, please try again";
		console.error(message);
		throw { error: message };
	}
};

export const bulkAcceptSuggestedEvents = async (ids: SuggestedEventId[]) => {
	const { session } = await getUserAuth();
	try {
		const result = await db.transaction(async (tx) => {
			await tx
				.update(suggestedEvents)
				.set({ status: "approved" })
				.where(inArray(suggestedEvents.id, ids));

			const updatedSuggestedEvents = await tx
				.select()
				.from(suggestedEvents)
				.where(inArray(suggestedEvents.id, ids));

			const insertedSavedEvents = await tx.insert(savedEvents).values(
				updatedSuggestedEvents.map((event) => ({
					...event,
					id: nanoid(),
					userId: session?.user.id!,
					suggestedEventId: event.id,
				})),
			);

			return {
				suggestedEvents: updatedSuggestedEvents,
				savedEvents: insertedSavedEvents,
			};
		});

		return result;
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

export const bulkRejectSuggestedEvents = async (ids: SuggestedEventId[]) => {
	const parsedIds = z
		.array(suggestedEventIdSchema)
		.parse(ids.map((id) => ({ id })))
		.map(({ id }) => id);

	try {
		await db
			.update(suggestedEvents)
			.set({ status: "rejected" })
			.where(inArray(suggestedEvents.id, parsedIds));
	} catch (err) {
		const message = (err as Error).message ?? "Error, please try again";
		console.error(message);
		throw { error: message };
	}
};
