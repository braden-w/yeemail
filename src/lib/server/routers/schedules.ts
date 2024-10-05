import { getScheduleById, getSchedules } from "@/lib/api/schedules/queries";
import { publicProcedure, router } from "@/lib/server/trpc";
import {
  scheduleIdSchema,
  insertScheduleParams,
  updateScheduleParams,
} from "@/lib/db/schema/schedules";
import { createSchedule, deleteSchedule, updateSchedule } from "@/lib/api/schedules/mutations";

export const schedulesRouter = router({
  getSchedules: publicProcedure.query(async () => {
    return getSchedules();
  }),
  getScheduleById: publicProcedure.input(scheduleIdSchema).query(async ({ input }) => {
    return getScheduleById(input.id);
  }),
  createSchedule: publicProcedure
    .input(insertScheduleParams)
    .mutation(async ({ input }) => {
      return createSchedule(input);
    }),
  updateSchedule: publicProcedure
    .input(updateScheduleParams)
    .mutation(async ({ input }) => {
      return updateSchedule(input.id, input);
    }),
  deleteSchedule: publicProcedure
    .input(scheduleIdSchema)
    .mutation(async ({ input }) => {
      return deleteSchedule(input.id);
    }),
});
