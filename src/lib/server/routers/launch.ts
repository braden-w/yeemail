import { processGmailsAfterDate } from "@/lib/api/gmails";
import { getUserAuth } from "@/lib/auth/utils";
import { publicProcedure, router } from "@/lib/server/trpc";
import { z } from "zod";

export const launchRouter = router({
	launchEmails: publicProcedure
		.input(z.object({ startDate: z.date() }))
		.mutation(async ({ input }) => {
			const { session } = await getUserAuth();
			if (!session) {
				throw new Error("User not authenticated");
			}
			const { emails, events } = await processGmailsAfterDate({
				token: session.user.googleAccessToken,
				date: input.startDate,
			});
			return { emails, events };
		}),
});
