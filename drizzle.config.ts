import crypto from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { defineConfig } from "drizzle-kit";
import { env } from "./env";

function durableObjectNamespaceIdFromName(uniqueKey: string, name: string): string {
  const key = crypto.createHash("sha256").update(uniqueKey).digest();
  const nameHmac = crypto.createHmac("sha256", key).update(name).digest().subarray(0, 16);
  const hmac = crypto.createHmac("sha256", key).update(nameHmac).digest().subarray(0, 16);
  return Buffer.concat([nameHmac, hmac]).toString("hex");
}

const isLocal = !!process.env.LOCAL;
const localDbDir = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";
const localDbPath = `${localDbDir}/${durableObjectNamespaceIdFromName("miniflare-D1DatabaseObject", env.CLOUDFLARE_DATABASE_ID)}.sqlite`;
if (isLocal && !existsSync(localDbPath)) {
  mkdirSync(localDbDir, { recursive: true });
  writeFileSync(localDbPath, "");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  driver: isLocal ? undefined : "d1-http",
  dbCredentials: isLocal
    ? {
        url: localDbPath,
      }
    : {
        accountId: env.CLOUDFLARE_ACCOUNT_ID,
        databaseId: env.CLOUDFLARE_DATABASE_ID,
        token: env.CLOUDFLARE_D1_TOKEN,
      },
});
