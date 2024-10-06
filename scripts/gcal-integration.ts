import { db } from "@/lib/db";

const allEvents = await db.query.suggestedEvents.findMany();

console.log(allEvents);
