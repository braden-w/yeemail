import { getRawEventById, getRawEvents } from "@/lib/api/rawEvents/queries";
import { publicProcedure, router } from "@/lib/server/trpc";
import {
	rawEventIdSchema,
	insertRawEventParams,
	updateRawEventParams,
} from "@/lib/db/schema/rawEvents";
import {
	createRawEvent,
	deleteRawEvent,
	updateRawEvent,
} from "@/lib/api/rawEvents/mutations";

export const rawEventsRouter = router({
	getRawEvents: publicProcedure.query(async () => {
		return getRawEvents();
	}),
	getRawEventById: publicProcedure
		.input(rawEventIdSchema)
		.query(async ({ input }) => {
			return getRawEventById(input.id);
		}),
	createRawEvent: publicProcedure
		.input(insertRawEventParams)
		.mutation(async ({ input }) => {
			return createRawEvent(input);
		}),
	updateRawEvent: publicProcedure
		.input(updateRawEventParams)
		.mutation(async ({ input }) => {
			return updateRawEvent(input.id, input);
		}),
	deleteRawEvent: publicProcedure
		.input(rawEventIdSchema)
		.mutation(async ({ input }) => {
			return deleteRawEvent(input.id);
		}),
});
