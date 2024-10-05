import { computersRouter } from "./computers";
import { router } from "@/lib/server/trpc";
import { suggestedEventsRouter } from "./suggestedEvents";
import { savedEventsRouter } from "./savedEvents";
import { schedulesRouter } from "./schedules";
import { emailsRouter } from "./emails";

export const appRouter = router({
	computers: computersRouter,
	suggestedEvents: suggestedEventsRouter,
	savedEvents: savedEventsRouter,
	schedules: schedulesRouter,
	emails: emailsRouter,
});

export type AppRouter = typeof appRouter;
