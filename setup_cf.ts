import { writeFileSync } from "node:fs";
import Cloudflare from "cloudflare";
import { Logger } from "tslog";

const log = new Logger({ name: "setup" });
const DATABASE_NAME = "maven_search_prod";

async function main() {
  const token = process.argv[2];

  if (!token) {
    log.error(`Usage: bun run ${import.meta.file} <CLOUDFLARE_API_TOKEN>`);
    log.error("  CLOUDFLARE_API_TOKEN: A Cloudflare API token with permissions: 'D1:Edit, Account Settings:Read'");
    process.exit(1);
  }

  const client = new Cloudflare({ apiToken: token });

  // Fetch account ID
  log.info("Fetching account ID...");
  const accounts = await client.accounts.list();
  const account = accounts.result?.[0];

  log.error(accounts);

  if (!account?.id) {
    log.error("No Cloudflare account found for this token");
    process.exit(1);
  }

  const accountId = account.id;
  log.info(`Using account: ${account.name} (${accountId})`);

  // Check if database already exists
  log.info(`Checking if database "${DATABASE_NAME}" already exists...`);
  const databases = await client.d1.database.list({ account_id: accountId });
  const existingDb = databases.result?.find((db) => db.name === DATABASE_NAME);

  if (existingDb) {
    log.error(`Database "${DATABASE_NAME}" already exists (ID: ${existingDb.uuid})`);
    log.error("Please delete it first if you want to recreate it.");
    process.exit(1);
  }

  // Create D1 database
  log.info(`Creating D1 database "${DATABASE_NAME}"...`);
  const database = await client.d1.database.create({
    account_id: accountId,
    name: DATABASE_NAME,
  });

  if (!database.uuid) {
    log.error("Failed to create database - no UUID returned");
    process.exit(1);
  }

  const databaseId = database.uuid;
  log.info(`Database created with ID: ${databaseId}`);

  // Write .env file
  log.info("Writing .env file...");
  const envContent = `CLOUDFLARE_ACCOUNT_ID=${accountId}
CLOUDFLARE_DATABASE_ID=${databaseId}
CLOUDFLARE_D1_TOKEN=${token}
`;
  writeFileSync(".env", envContent);
  log.info("Created .env");

  // Write root wrangler.jsonc
  log.info("Writing wrangler.jsonc files...");

  const rootWrangler = {
    $schema: "./node_modules/wrangler/config-schema.json",
    d1_databases: [
      {
        binding: "DB",
        database_name: DATABASE_NAME,
        database_id: databaseId,
      },
    ],
    observability: {
      enabled: true,
    },
    dev: {
      ip: "127.0.0.1",
      port: 8080,
    },
  };
  writeFileSync("wrangler.jsonc", `${JSON.stringify(rootWrangler, null, 2)} \n`);
  log.info("Created wrangler.jsonc");

  // Write src/scraper/wrangler.jsonc
  const scraperWrangler = {
    $schema: "./node_modules/wrangler/config-schema.json",
    name: "maven_search_scraper",
    compatibility_date: "2025-12-31",
    compatibility_flags: ["nodejs_compat"],
    main: "worker.ts",
    triggers: {
      crons: ["0 0 * * *"],
    },
    d1_databases: [
      {
        binding: "DB",
        database_name: DATABASE_NAME,
        database_id: databaseId,
      },
    ],
    observability: {
      enabled: true,
    },
    dev: {
      ip: "127.0.0.1",
      port: 8080,
    },
  };
  writeFileSync("src/scraper/wrangler.jsonc", `${JSON.stringify(scraperWrangler, null, 2)} \n`);
  log.info("Created src/scraper/wrangler.jsonc");

  // Write src/web/wrangler.jsonc
  const webWrangler = {
    $schema: "./node_modules/wrangler/config-schema.json",
    name: "maven_search_web",
    compatibility_date: "2025-12-31",
    compatibility_flags: ["nodejs_compat"],
    main: "@tanstack/react-start/server-entry",
    d1_databases: [
      {
        binding: "DB",
        database_name: DATABASE_NAME,
        database_id: databaseId,
      },
    ],
    observability: {
      enabled: true,
    },
    dev: {
      ip: "127.0.0.1",
      port: 8081,
    },
  };
  writeFileSync("src/web/wrangler.jsonc", `${JSON.stringify(webWrangler, null, 2)} \n`);
  log.info("Created src/web/wrangler.jsonc");

  log.info("Setup complete!");
  log.info("Next steps:");
  log.info("  1. Run migrations: bun drizzle-kit push");
  log.info("  2. Start dev server: bun run web:dev");
}

main().catch((error) => {
  log.error("Setup failed:", error.message);
  process.exit(1);
});
