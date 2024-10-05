import { db } from "@/lib/db/index";
import {
	type CompleteSavedEvent,
	savedEvents,
} from "@/lib/db/schema/savedEvents";
import {
	type SuggestedEventId,
	suggestedEventIdSchema,
	suggestedEvents,
} from "@/lib/db/schema/suggestedEvents";
import { eq } from "drizzle-orm";

export const getSuggestedEvents = async () => {
	const rows = await db.select().from(suggestedEvents);
	const r = rows;
	return { suggestedEvents: r };
};

export const getSuggestedEventById = async (id: SuggestedEventId) => {
	const { id: suggestedEventId } = suggestedEventIdSchema.parse({ id });
	const [row] = await db
		.select()
		.from(suggestedEvents)
		.where(eq(suggestedEvents.id, suggestedEventId));
	if (row === undefined) return {};
	const r = row;
	return { suggestedEvent: r };
};

export const getSuggestedEventByIdWithSavedEvents = async (
	id: SuggestedEventId,
) => {
	const { id: suggestedEventId } = suggestedEventIdSchema.parse({ id });
	const rows = await db
		.select({ suggestedEvent: suggestedEvents, savedEvent: savedEvents })
		.from(suggestedEvents)
		.where(eq(suggestedEvents.id, suggestedEventId))
		.leftJoin(
			savedEvents,
			eq(suggestedEvents.id, savedEvents.suggestedEventId),
		);
	if (rows.length === 0) return {};
	const r = rows[0].suggestedEvent;
	const rs = rows
		.filter((r) => r.savedEvent !== null)
		.map((s) => s.savedEvent) as CompleteSavedEvent[];

	return { suggestedEvent: r, savedEvents: rs };
};
