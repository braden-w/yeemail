import { getUserAuth } from "@/lib/auth/utils";
import { db } from "@/lib/db/index";
import {
	type NewScheduleParams,
	type ScheduleId,
	type UpdateScheduleParams,
	insertScheduleSchema,
	scheduleIdSchema,
	schedules,
	updateScheduleSchema,
} from "@/lib/db/schema/schedules";
import { and, eq } from "drizzle-orm";

export const createSchedule = async (schedule: NewScheduleParams) => {
	const { session } = await getUserAuth();
	const newSchedule = insertScheduleSchema.parse({
		...schedule,
		userId: session?.user.id!,
	});
	try {
		const [s] = await db.insert(schedules).values(newSchedule).returning();
		return { schedule: s };
	} catch (err) {
		const message = (err as Error).message ?? "Error, please try again";
		console.error(message);
		throw { error: message };
	}
};

export const updateSchedule = async (
	id: ScheduleId,
	schedule: UpdateScheduleParams,
) => {
	const { session } = await getUserAuth();
	const { id: scheduleId } = scheduleIdSchema.parse({ id });
	const newSchedule = updateScheduleSchema.parse({
		...schedule,
		userId: session?.user.id!,
	});
	try {
		const [s] = await db
			.update(schedules)
			.set({ ...newSchedule, updatedAt: new Date() })
			.where(
				and(
					eq(schedules.id, scheduleId!),
					eq(schedules.userId, session?.user.id!),
				),
			)
			.returning();
		return { schedule: s };
	} catch (err) {
		const message = (err as Error).message ?? "Error, please try again";
		console.error(message);
		throw { error: message };
	}
};

export const deleteSchedule = async (id: ScheduleId) => {
	const { session } = await getUserAuth();
	const { id: scheduleId } = scheduleIdSchema.parse({ id });
	try {
		const [s] = await db
			.delete(schedules)
			.where(
				and(
					eq(schedules.id, scheduleId!),
					eq(schedules.userId, session?.user.id!),
				),
			)
			.returning();
		return { schedule: s };
	} catch (err) {
		const message = (err as Error).message ?? "Error, please try again";
		console.error(message);
		throw { error: message };
	}
};
