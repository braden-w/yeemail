import { computersRouter } from "./computers";
import { router } from "@/lib/server/trpc";
import { rawEventsRouter } from "./rawEvents";
import { savedEventsRouter } from "./savedEvents";

export const appRouter = router({
  computers: computersRouter,
  rawEvents: rawEventsRouter,
  savedEvents: savedEventsRouter,
});

export type AppRouter = typeof appRouter;
