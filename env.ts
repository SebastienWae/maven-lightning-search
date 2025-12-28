import { z } from "zod";

const envSchema = z.object({
  DB_FILE_NAME: z.string().default("dev.sqlite"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(z.prettifyError(parsed.error));
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
