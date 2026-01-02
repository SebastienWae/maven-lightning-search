import { drizzle } from "drizzle-orm/d1";
import { Logger } from "tslog";
import { saveWorkshopsToDatabase, scrapeWorkshops } from "./scraper";

const logger = new Logger({ name: "scraper:worker", type: "json", argumentsArrayName: "messages" });

async function runScrape(env: Env): Promise<void> {
  const db = drizzle(env.DB);
  const workshops = await scrapeWorkshops();
  await saveWorkshopsToDatabase(db, workshops);
}

export default {
  async scheduled(event, env, _ctx): Promise<void> {
    logger.info({ cron: event.cron }, "Cron triggered");
    try {
      await runScrape(env);
      logger.info("Scrape completed successfully");
    } catch (error) {
      logger.error({ error }, "Scrape failed");
      throw error;
    }
  },

  async fetch(request, env, _ctx): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname !== "/trigger") {
      return new Response("Not Found", { status: 404 });
    }

    logger.info("Manual scrape triggered via fetch");
    try {
      await runScrape(env);
      logger.info("Scrape completed successfully");
      return new Response("Scrape completed successfully", { status: 200 });
    } catch (error) {
      logger.error({ error }, "Scrape failed");
      return new Response("Scrape failed", { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;
