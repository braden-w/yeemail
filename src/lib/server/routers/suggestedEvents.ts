import {
	createSuggestedEvent,
	deleteSuggestedEvent,
	updateSuggestedEvent,
} from "@/lib/api/suggestedEvents/mutations";
import {
	getSuggestedEventById,
	getSuggestedEvents,
} from "@/lib/api/suggestedEvents/queries";
import {
	insertSuggestedEventParams,
	suggestedEventIdSchema,
	updateSuggestedEventParams,
} from "@/lib/db/schema/suggestedEvents";
import { publicProcedure, router } from "@/lib/server/trpc";

export const suggestedEventsRouter = router({
	getSuggestedEvents: publicProcedure.query(async () => {
		return getSuggestedEvents();
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
});
