import {
	acceptSuggestedEvent,
	bulkAcceptSuggestedEvents,
	bulkRejectSuggestedEvents,
	createSuggestedEvent,
	deleteSuggestedEvent,
	rejectSuggestedEvent,
	updateSuggestedEvent,
} from "@/lib/api/suggestedEvents/mutations";
import {
	getPendingSuggestedEvents,
	getSuggestedEventById,
	getSuggestedEvents,
} from "@/lib/api/suggestedEvents/queries";
import {
	insertSuggestedEventParams,
	suggestedEventIdSchema,
	updateSuggestedEventParams,
} from "@/lib/db/schema/suggestedEvents";
import { publicProcedure, router } from "@/lib/server/trpc";
import { z } from "zod";

export const suggestedEventsRouter = router({
	getSuggestedEvents: publicProcedure.query(async () => {
		return getSuggestedEvents();
	}),
	getPendingSuggestedEvents: publicProcedure.query(async () => {
		return getPendingSuggestedEvents();
	}),
	getSuggestedEventById: publicProcedure
		.input(suggestedEventIdSchema)
		.query(async ({ input }) => {
			return getSuggestedEventById(input.id);
		}),
	createSuggestedEvent: publicProcedure
		.input(insertSuggestedEventParams)
		.mutation(async ({ input }) => {
			return createSuggestedEvent(input);
		}),
	updateSuggestedEvent: publicProcedure
		.input(updateSuggestedEventParams)
		.mutation(async ({ input }) => {
			return updateSuggestedEvent(input.id, input);
		}),
	deleteSuggestedEvent: publicProcedure
		.input(suggestedEventIdSchema)
		.mutation(async ({ input }) => {
			return deleteSuggestedEvent(input.id);
		}),

	acceptSuggestedEvent: publicProcedure
		.input(suggestedEventIdSchema)
		.mutation(async ({ input }) => {
			return acceptSuggestedEvent(input.id);
		}),
	bulkAcceptSuggestedEvents: publicProcedure
		.input(z.object({ ids: z.array(suggestedEventIdSchema.shape.id) }))
		.mutation(async ({ input: { ids } }) => {
			return bulkAcceptSuggestedEvents(ids);
		}),
	rejectSuggestedEvent: publicProcedure
		.input(suggestedEventIdSchema)
		.mutation(async ({ input }) => {
			return rejectSuggestedEvent(input.id);
		}),
	bulkRejectSuggestedEvents: publicProcedure
		.input(z.object({ ids: z.array(suggestedEventIdSchema.shape.id) }))
		.mutation(async ({ input: { ids } }) => {
			return bulkRejectSuggestedEvents(ids);
		}),
});
