import {
	bulkExportSavedEvents,
	createSavedEvent,
	deleteSavedEvent,
	updateSavedEvent,
} from "@/lib/api/savedEvents/mutations";
import {
	getSavedEventById,
	getSavedEvents,
} from "@/lib/api/savedEvents/queries";
import {
	insertSavedEventParams,
	savedEventIdSchema,
	updateSavedEventParams,
} from "@/lib/db/schema/savedEvents";
import { publicProcedure, router } from "@/lib/server/trpc";
import { z } from "zod";

export const savedEventsRouter = router({
	getSavedEvents: publicProcedure.query(async () => {
		return getSavedEvents();
	}),
	getSavedEventById: publicProcedure
		.input(savedEventIdSchema)
		.query(async ({ input }) => {
			return getSavedEventById(input.id);
		}),
	createSavedEvent: publicProcedure
		.input(insertSavedEventParams)
		.mutation(async ({ input }) => {
			return createSavedEvent(input);
		}),
	updateSavedEvent: publicProcedure
		.input(updateSavedEventParams)
		.mutation(async ({ input }) => {
			return updateSavedEvent(input.id, input);
		}),
	deleteSavedEvent: publicProcedure
		.input(savedEventIdSchema)
		.mutation(async ({ input }) => {
			return deleteSavedEvent(input.id);
		}),
	exportSavedEvent: publicProcedure
		.input(savedEventIdSchema)
		.mutation(async ({ input }) => {
			return bulkExportSavedEvents([input.id]);
		}),
	bulkExportSavedEvents: publicProcedure
		.input(z.object({ ids: z.array(savedEventIdSchema.shape.id) }))
		.mutation(async ({ input: { ids } }) => {
			return bulkExportSavedEvents(ids);
		}),
});
