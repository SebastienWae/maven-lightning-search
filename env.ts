import { existsSync } from "node:fs";
import * as path from "node:path";
import { z } from "zod";

const envSchema = z.object({
  DB_FILE_NAME: z.string()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(z.prettifyError(parsed.error));
  throw new Error("Invalid environment variables");
}

function findRepoRoot(startDir: string): string {
  let currentDir = path.resolve(startDir);

  while (true) {
    if (existsSync(path.join(currentDir, "bun.lock"))) {
      return currentDir;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      return path.resolve(startDir);
    }

    currentDir = parentDir;
  }
}

function resolveDbFileName(dbFileName: string): string {
  if (dbFileName === ":memory:") {
    return dbFileName;
  }

  if (path.isAbsolute(dbFileName)) {
    return dbFileName;
  }

  const repoRoot = findRepoRoot(process.cwd());
  return path.resolve(repoRoot, dbFileName);
}

export const env = {
  ...parsed.data,
  DB_FILE_NAME: resolveDbFileName(parsed.data.DB_FILE_NAME),
};
