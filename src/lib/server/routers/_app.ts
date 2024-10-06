import { router } from "@/lib/server/trpc";
import { emailsRouter } from "./emails";
import { savedEventsRouter } from "./savedEvents";
import { schedulesRouter } from "./schedules";
import { suggestedEventsRouter } from "./suggestedEvents";

export const appRouter = router({
	suggestedEvents: suggestedEventsRouter,
	savedEvents: savedEventsRouter,
	schedules: schedulesRouter,
	emails: emailsRouter,
});

export type AppRouter = typeof appRouter;
