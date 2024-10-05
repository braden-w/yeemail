import { computersRouter } from "./computers";
import { router } from "@/lib/server/trpc";
import { rawEventsRouter } from "./rawEvents";
import { savedEventsRouter } from "./savedEvents";
import { schedulesRouter } from "./schedules";

export const appRouter = router({
  computers: computersRouter,
  rawEvents: rawEventsRouter,
  savedEvents: savedEventsRouter,
  schedules: schedulesRouter,
});

export type AppRouter = typeof appRouter;
