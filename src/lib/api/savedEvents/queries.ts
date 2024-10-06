import { getUserAuth } from "@/lib/auth/utils";
import { db } from "@/lib/db/index";
import {
	type SavedEventId,
	savedEventIdSchema,
	savedEvents,
} from "@/lib/db/schema/savedEvents";
import { suggestedEvents } from "@/lib/db/schema/suggestedEvents";
import { and, eq } from "drizzle-orm";

export const getSavedEvents = async () => {
	const { session } = await getUserAuth();
	const rows = await db
		.select({ savedEvent: savedEvents, suggestedEvent: suggestedEvents })
		.from(savedEvents)
		.leftJoin(
			suggestedEvents,
			eq(savedEvents.suggestedEventId, suggestedEvents.id),
		)
		.where(eq(savedEvents.userId, session?.user.id!));
	const s = rows.map((r) => ({
		...r.savedEvent,
		suggestedEvent: r.suggestedEvent,
	}));
	return { savedEvents: s };
};

export const getPendingSavedEvents = async () => {
	const { session } = await getUserAuth();
	const rows = await db
		.select({ savedEvent: savedEvents, suggestedEvent: suggestedEvents })
		.from(savedEvents)
		.leftJoin(
			suggestedEvents,
			eq(savedEvents.suggestedEventId, suggestedEvents.id),
		)
		.where(
			and(
				eq(savedEvents.status, "pending"),
				eq(savedEvents.userId, session?.user.id!),
			),
		);

	const s = rows.map((r) => ({
		...r.savedEvent,
		suggestedEvent: r.suggestedEvent,
	}));
	return { pendingSavedEvents: s };
};

export const getSavedEventById = async (id: SavedEventId) => {
	const { session } = await getUserAuth();
	const { id: savedEventId } = savedEventIdSchema.parse({ id });
	const [row] = await db
		.select({ savedEvent: savedEvents, suggestedEvent: suggestedEvents })
		.from(savedEvents)
		.where(
			and(
				eq(savedEvents.id, savedEventId),
				eq(savedEvents.userId, session?.user.id!),
			),
		)
		.leftJoin(
			suggestedEvents,
			eq(savedEvents.suggestedEventId, suggestedEvents.id),
		);
	if (row === undefined) return {};
	const s = { ...row.savedEvent, suggestedEvent: row.suggestedEvent };
	return { savedEvent: s };
};
