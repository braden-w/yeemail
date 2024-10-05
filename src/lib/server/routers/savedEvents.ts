import { getSavedEventById, getSavedEvents } from "@/lib/api/savedEvents/queries";
import { publicProcedure, router } from "@/lib/server/trpc";
import {
  savedEventIdSchema,
  insertSavedEventParams,
  updateSavedEventParams,
} from "@/lib/db/schema/savedEvents";
import { createSavedEvent, deleteSavedEvent, updateSavedEvent } from "@/lib/api/savedEvents/mutations";

export const savedEventsRouter = router({
  getSavedEvents: publicProcedure.query(async () => {
    return getSavedEvents();
  }),
  getSavedEventById: publicProcedure.input(savedEventIdSchema).query(async ({ input }) => {
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
});
