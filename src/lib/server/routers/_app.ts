import { router } from "@/lib/server/trpc";
import { emailsRouter } from "./emails";
import { launchRouter } from "./launch";
import { savedEventsRouter } from "./savedEvents";
import { schedulesRouter } from "./schedules";
import { suggestedEventsRouter } from "./suggestedEvents";

export const appRouter = router({
	suggestedEvents: suggestedEventsRouter,
	savedEvents: savedEventsRouter,
	schedules: schedulesRouter,
	emails: emailsRouter,
	launch: launchRouter,
});

export type AppRouter = typeof appRouter;
