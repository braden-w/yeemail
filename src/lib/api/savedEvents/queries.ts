import { db } from "@/lib/db/index";
import {
	type SavedEventId,
	savedEventIdSchema,
	savedEvents,
} from "@/lib/db/schema/savedEvents";
import { suggestedEvents } from "@/lib/db/schema/suggestedEvents";
import { eq } from "drizzle-orm";

export const getSavedEvents = async () => {
	const rows = await db
		.select({ savedEvent: savedEvents, suggestedEvent: suggestedEvents })
		.from(savedEvents)
		.leftJoin(
			suggestedEvents,
			eq(savedEvents.suggestedEventId, suggestedEvents.id),
		);
	const s = rows.map((r) => ({
		...r.savedEvent,
		suggestedEvent: r.suggestedEvent,
	}));
	return { savedEvents: s };
};

export const getSavedEventById = async (id: SavedEventId) => {
	const { id: savedEventId } = savedEventIdSchema.parse({ id });
	const [row] = await db
		.select({ savedEvent: savedEvents, suggestedEvent: suggestedEvents })
		.from(savedEvents)
		.where(eq(savedEvents.id, savedEventId))
		.leftJoin(
			suggestedEvents,
			eq(savedEvents.suggestedEventId, suggestedEvents.id),
		);
	if (row === undefined) return {};
	const s = { ...row.savedEvent, suggestedEvent: row.suggestedEvent };
	return { savedEvent: s };
};
