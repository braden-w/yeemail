import { getUserAuth } from "@/lib/auth/utils";
import { db } from "@/lib/db/index";
import {
	type NewSavedEventParams,
	type SavedEventId,
	type UpdateSavedEventParams,
	insertSavedEventSchema,
	savedEventIdSchema,
	savedEvents,
	updateSavedEventSchema,
} from "@/lib/db/schema/savedEvents";
import { and, eq } from "drizzle-orm";

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
