import { db } from "@/lib/db/index";
import { eq, and } from "drizzle-orm";
import { getUserAuth } from "@/lib/auth/utils";
import { type ScheduleId, scheduleIdSchema, schedules } from "@/lib/db/schema/schedules";

export const getSchedules = async () => {
  const { session } = await getUserAuth();
  const rows = await db.select().from(schedules).where(eq(schedules.userId, session?.user.id!));
  const s = rows
  return { schedules: s };
};

export const getScheduleById = async (id: ScheduleId) => {
  const { session } = await getUserAuth();
  const { id: scheduleId } = scheduleIdSchema.parse({ id });
  const [row] = await db.select().from(schedules).where(and(eq(schedules.id, scheduleId), eq(schedules.userId, session?.user.id!)));
  if (row === undefined) return {};
  const s = row;
  return { schedule: s };
};


