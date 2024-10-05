import { db } from "@/lib/db/index";
import { eq } from "drizzle-orm";
import {
	type SavedEventId,
	savedEventIdSchema,
	savedEvents,
} from "@/lib/db/schema/savedEvents";
import { rawEvents } from "@/lib/db/schema/rawEvents";

export const getSavedEvents = async () => {
	const rows = await db
		.select({ savedEvent: savedEvents, rawEvent: rawEvents })
		.from(savedEvents)
		.leftJoin(rawEvents, eq(savedEvents.rawEventId, rawEvents.id));
	const s = rows.map((r) => ({ ...r.savedEvent, rawEvent: r.rawEvent }));
	return { savedEvents: s };
};

export const getSavedEventById = async (id: SavedEventId) => {
	const { id: savedEventId } = savedEventIdSchema.parse({ id });
	const [row] = await db
		.select({ savedEvent: savedEvents, rawEvent: rawEvents })
		.from(savedEvents)
		.where(eq(savedEvents.id, savedEventId))
		.leftJoin(rawEvents, eq(savedEvents.rawEventId, rawEvents.id));
	if (row === undefined) return {};
	const s = { ...row.savedEvent, rawEvent: row.rawEvent };
	return { savedEvent: s };
};
