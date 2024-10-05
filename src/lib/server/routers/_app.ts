import { computersRouter } from "./computers";
import { router } from "@/lib/server/trpc";
import { rawEventsRouter } from "./rawEvents";
import { savedEventsRouter } from "./savedEvents";
import { schedulesRouter } from "./schedules";
import { emailsRouter } from "./emails";

export const appRouter = router({
  computers: computersRouter,
  rawEvents: rawEventsRouter,
  savedEvents: savedEventsRouter,
  schedules: schedulesRouter,
  emails: emailsRouter,
});

export type AppRouter = typeof appRouter;
