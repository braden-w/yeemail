import * as schema from "@/lib/db/schema";
import { env } from "@/lib/env.mjs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = env.DATABASE_URL;
const client = postgres(connectionString);
export const db = drizzle(client, { schema, logger: true });
