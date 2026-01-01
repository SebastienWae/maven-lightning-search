import {
  instructor,
  workshop,
  workshopInstructors,
  workshopTag,
  workshopTags,
} from "@maven-lightning-search/db/schema";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Logger } from "tslog";
import { env } from "../../env";
import { type ApiResponse, ApiResponseSchema, type PublishedContentPageSection, type WorkshopItem } from "./schema";

const logger = new Logger({ name: "data:scraper" });

const db = drizzle(env.DB_FILE_NAME);

const API_BASE_URL = "https://api.maven.com/workshops/discoverable/by_tags";
const DEFAULT_LIMIT = 24;
const REQUEST_DELAY_MS = 100;
const API_HEADERS = {
  accept: "application/json, text/plain, */*",
};

/**
 * Fetches a single page of workshops from the Maven API
 */
async function fetchWorkshopPage(page: number, limit: number = DEFAULT_LIMIT): Promise<ApiResponse> {
  logger.info({ page, limit }, "Fetching workshop page");

  const url = new URL(API_BASE_URL);
  url.searchParams.set("tag_slug", "");
  url.searchParams.set("page", page.toString());
  url.searchParams.set("limit", limit.toString());
  url.searchParams.set("featured_tag_slug", "featured-ll");

  const response = await fetch(url.toString(), {
    headers: API_HEADERS,
  });

  if (!response.ok) {
    logger.error({ page, status: response.status, statusText: response.statusText }, "Failed to fetch workshop page");
    throw new Error(`Failed to fetch page ${page}: ${response.status} ${response.statusText}`);
  }

  const rawData = await response.json();

  const data = ApiResponseSchema.parse(rawData);
  return data;
}

/**
 * Scrapes all workshops from the Maven API with automatic pagination
 */
export async function scrapeWorkshops(): Promise<WorkshopItem[]> {
  const allItems: WorkshopItem[] = [];

  const firstPage = await fetchWorkshopPage(1);
  allItems.push(...firstPage.items);

  const totalPages = firstPage.metadata.pages;
  logger.info({ totalPages }, "Starting workshop scrape");
  logger.info(
    { page: 1, totalPages, itemsOnPage: firstPage.items.length, totalItems: allItems.length },
    "Fetched workshop page",
  );

  for (let page = 2; page <= totalPages; page++) {
    await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));

    try {
      const pageData = await fetchWorkshopPage(page);
      allItems.push(...pageData.items);
      logger.info(
        { page, totalPages, itemsOnPage: pageData.items.length, totalItems: allItems.length },
        "Fetched workshop page",
      );
    } catch (error) {
      logger.error({ page, error }, "Failed to fetch workshop page");
    }
  }

  logger.info({ totalItems: allItems.length }, "Workshop scrape complete");
  return allItems;
}

/**
 * Normalizes the name of an instructor
 */
function normalizeInstructorName(name: string): string {
  return name
    .trim()
    .normalize("NFC")
    .replace(/[\r\n]+/g, " ") // Replace newlines and carriage returns with spaces
    .replace(/\s+/g, " ") // Collapse all whitespace to single spaces
    .replace(/[^\p{L}\p{N}\s-]/gu, "") // Remove all except letters, numbers, spaces, hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Creates a SHA-256 hash from instructor name and image URL
 */
function createInstructorIdentityHash(name: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(name);
  const hashBuffer = Bun.CryptoHasher.hash("sha256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Gets or creates an instructor and returns the instructor ID
 */
async function getOrCreateInstructor(name: string, imageUrl: string): Promise<string> {
  const normalizedName = normalizeInstructorName(name);
  const identityHash = createInstructorIdentityHash(normalizedName);

  const instructorData = {
    id: identityHash,
    name: normalizedName,
    imageUrl,
    createdAt: new Date().toISOString(),
  };

  const existing = db.select().from(instructor).where(eq(instructor.id, identityHash)).limit(1).get();
  if (existing) {
    await db.update(instructor).set(instructorData).where(eq(instructor.id, identityHash));
  } else {
    await db.insert(instructor).values(instructorData);
  }

  return identityHash;
}

/**
 * Gets or creates a tag and returns the tag ID
 */
async function getOrCreateTag(id: number, slug: string, name: string): Promise<number> {
  const tagData = {
    id,
    slug,
    name,
  };

  const existing = db.select().from(workshopTag).where(eq(workshopTag.id, id)).limit(1).get();

  if (!existing) {
    await db.insert(workshopTag).values(tagData);
  }

  return id;
}

/**
 * Formats the description of a workshop
 */
function formatDescription(mainSection: PublishedContentPageSection) {
  return `${mainSection.topic_desc}

${mainSection.learning_outcomes.map((outcome) => `- ${outcome.title}: ${outcome.description}`).join("\n")}`;
}

/**
 * Saves workshop data to the database
 */
export async function saveWorkshopsToDatabase(workshops: WorkshopItem[]): Promise<void> {
  let savedCount = 0;
  let updatedCount = 0;

  for (const item of workshops) {
    const { published_content_page: page } = item;
    const { school_event: event } = page;

    const mainSection = page.sections.find((section) => section.section_type === "main");
    if (!mainSection) {
      logger.warn({ workshopId: item.id }, "Workshop missing main section, skipping");
      continue;
    }

    const workshopData = {
      id: item.id,
      slug: page.slug,
      title: mainSection.title,
      description: formatDescription(mainSection),
      imageUrl: mainSection.image_url,
      isCanceled: item.is_canceled,
      isDelisted: item.is_delisted,
      isFeatured: item.workshop_tags.some((tag) => tag.slug === "featured-ll"),
      startTimestamp: Math.floor(new Date(event.start_datetime).getTime() / 1000),
      endTimestamp: Math.floor(new Date(event.end_datetime).getTime() / 1000),
      durationMin: event.duration_min,
      hasInternalRecording: event.has_internal_recording,
      isRecordingPublic: event.is_recording_public,
      numSignups: page.num_signups,
    };

    const existing = db.select().from(workshop).where(eq(workshop.id, item.id)).limit(1).get();

    if (existing) {
      await db.update(workshop).set(workshopData).where(eq(workshop.id, item.id));
      updatedCount++;
    } else {
      await db.insert(workshop).values(workshopData);
      savedCount++;
    }

    for (const { name, image_url } of mainSection.instructor_infos) {
      const instructorId = await getOrCreateInstructor(name, image_url);
      const existingRelation = db
        .select()
        .from(workshopInstructors)
        .where(and(eq(workshopInstructors.workshopId, item.id), eq(workshopInstructors.instructorId, instructorId)))
        .limit(1)
        .get();
      if (!existingRelation) {
        await db.insert(workshopInstructors).values({
          workshopId: item.id,
          instructorId,
        });
      }
    }

    for (const tag of item.workshop_tags) {
      const tagId = await getOrCreateTag(tag.id, tag.slug, tag.label);
      const existingRelation = db
        .select()
        .from(workshopTags)
        .where(and(eq(workshopTags.workshopId, item.id), eq(workshopTags.tagId, tagId)))
        .limit(1)
        .get();
      if (!existingRelation) {
        await db.insert(workshopTags).values({
          workshopId: item.id,
          tagId,
        });
      }
    }
  }

  logger.info({ saved: savedCount, updated: updatedCount }, "Workshops saved to database");
}

/**
 * Main execution function
 */
export async function main(): Promise<void> {
  try {
    logger.info("Starting Maven workshop scraper");
    const workshops = await scrapeWorkshops();
    await saveWorkshopsToDatabase(workshops);
    logger.info("Scraper finished");
  } catch (error) {
    logger.error({ error }, "Scraper failed");
    process.exit(1);
  }
}

// Run main if this file is executed directly
if (import.meta.main) {
  await main();
}
