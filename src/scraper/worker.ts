import { drizzle } from "drizzle-orm/d1";
import { Logger } from "tslog";
import { saveWorkshopsToDatabase, scrapeWorkshops } from "./scraper";

const logger = new Logger({ name: "scraper:worker", type: "json", argumentsArrayName: "messages" });

export default {
  async scheduled(event, env, _ctx): Promise<void> {
    logger.info({ cron: event.cron }, "Cron triggered");

    const db = drizzle(env.DB);

    try {
      const workshops = await scrapeWorkshops();
      await saveWorkshopsToDatabase(db, workshops);
      logger.info("Scrape completed successfully");
    } catch (error) {
      logger.error({ error }, "Scrape failed");
      throw error;
    }
  },
} satisfies ExportedHandler<Env>;
