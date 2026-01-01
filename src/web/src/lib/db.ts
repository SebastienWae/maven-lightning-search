import * as schema from "@maven-lightning-search/db/schema";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { env } from "../../../../env";

export const db = drizzle(env.DB_FILE_NAME, { schema });
