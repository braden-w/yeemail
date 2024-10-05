import { db } from "@/lib/db/index";
import { eq } from "drizzle-orm";
import {
	type RawEventId,
	rawEventIdSchema,
	rawEvents,
} from "@/lib/db/schema/rawEvents";
import {
	savedEvents,
	type CompleteSavedEvent,
} from "@/lib/db/schema/savedEvents";

export const getRawEvents = async () => {
	const rows = await db.select().from(rawEvents);
	const r = rows;
	return { rawEvents: r };
};

export const getRawEventById = async (id: RawEventId) => {
	const { id: rawEventId } = rawEventIdSchema.parse({ id });
	const [row] = await db
		.select()
		.from(rawEvents)
		.where(eq(rawEvents.id, rawEventId));
	if (row === undefined) return {};
	const r = row;
	return { rawEvent: r };
};

export const getRawEventByIdWithSavedEvents = async (id: RawEventId) => {
	const { id: rawEventId } = rawEventIdSchema.parse({ id });
	const rows = await db
		.select({ rawEvent: rawEvents, savedEvent: savedEvents })
		.from(rawEvents)
		.where(eq(rawEvents.id, rawEventId))
		.leftJoin(savedEvents, eq(rawEvents.id, savedEvents.rawEventId));
	if (rows.length === 0) return {};
	const r = rows[0].rawEvent;
	const rs = rows
		.filter((r) => r.savedEvent !== null)
		.map((s) => s.savedEvent) as CompleteSavedEvent[];

	return { rawEvent: r, savedEvents: rs };
};
