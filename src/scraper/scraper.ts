import {
  instructor,
  workshop,
  workshopInstructors,
  workshopTag,
  workshopTags,
} from "@maven-lightning-search/db/schema";

import { sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { Logger } from "tslog";
import { type ApiResponse, ApiResponseSchema, type PublishedContentPageSection, type WorkshopItem } from "./schema";

const logger = new Logger({ name: "scraper:scraper", type: "json", argumentsArrayName: "messages" });

const API_BASE_URL = "https://api.maven.com/workshops/discoverable/by_tags";
const DEFAULT_LIMIT = 24;
const REQUEST_DELAY_MS = 10;
const API_HEADERS = {
  accept: "application/json, text/plain, */*",
};

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

async function createInstructorIdentityHash(name: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(name);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function formatDescription(mainSection: PublishedContentPageSection) {
  return `${mainSection.topic_desc}

${mainSection.learning_outcomes.map((outcome) => `- ${outcome.title}: ${outcome.description}`).join("\n")}`;
}

// D1 has a max of 100 bound parameters per query
const BATCH_SIZES = {
  instructor: 30, // 3 columns → 90 params
  workshopTag: 30, // 3 columns → 90 params
  workshop: 7, // 13 columns → 91 params
  workshopInstructors: 50, // 2 columns → 100 params
  workshopTags: 50, // 2 columns → 100 params
} as const;

export async function saveWorkshopsToDatabase(db: DrizzleD1Database, workshops: WorkshopItem[]): Promise<void> {
  // Phase 1: Collect all data
  const workshopDataArray: (typeof workshop.$inferInsert)[] = [];
  const instructorMap = new Map<string, typeof instructor.$inferInsert>();
  const tagMap = new Map<number, typeof workshopTag.$inferInsert>();
  const workshopInstructorRelations: (typeof workshopInstructors.$inferInsert)[] = [];
  const workshopTagRelations: (typeof workshopTags.$inferInsert)[] = [];

  for (const item of workshops) {
    const { published_content_page: page } = item;
    const { school_event: event } = page;

    const mainSection = page.sections.find((section) => section.section_type === "main");
    if (!mainSection) {
      logger.warn({ workshopId: item.id }, "Workshop missing main section, skipping");
      continue;
    }

    // Collect workshop data
    workshopDataArray.push({
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
    });

    // Collect instructors and relations
    for (const { name, image_url } of mainSection.instructor_infos) {
      const normalizedName = normalizeInstructorName(name);
      const instructorId = await createInstructorIdentityHash(normalizedName);

      instructorMap.set(instructorId, {
        id: instructorId,
        name: normalizedName,
        imageUrl: image_url,
      });

      workshopInstructorRelations.push({
        workshopId: item.id,
        instructorId,
      });
    }

    // Collect tags and relations
    for (const tag of item.workshop_tags) {
      tagMap.set(tag.id, {
        id: tag.id,
        slug: tag.slug,
        name: tag.label,
      });

      workshopTagRelations.push({
        workshopId: item.id,
        tagId: tag.id,
      });
    }
  }

  // Phase 2: Batch insert with chunking
  for (const batch of chunk([...instructorMap.values()], BATCH_SIZES.instructor)) {
    await db
      .insert(instructor)
      .values(batch)
      .onConflictDoUpdate({
        target: instructor.id,
        set: {
          name: sql`excluded.name`,
          imageUrl: sql`excluded.image_url`,
        },
      });
  }

  for (const batch of chunk([...tagMap.values()], BATCH_SIZES.workshopTag)) {
    await db
      .insert(workshopTag)
      .values(batch)
      .onConflictDoUpdate({
        target: workshopTag.id,
        set: {
          slug: sql`excluded.slug`,
          name: sql`excluded.name`,
        },
      });
  }

  for (const batch of chunk(workshopDataArray, BATCH_SIZES.workshop)) {
    await db
      .insert(workshop)
      .values(batch)
      .onConflictDoUpdate({
        target: workshop.id,
        set: {
          slug: sql`excluded.slug`,
          title: sql`excluded.title`,
          description: sql`excluded.description`,
          imageUrl: sql`excluded.image_url`,
          isCanceled: sql`excluded.is_canceled`,
          isDelisted: sql`excluded.is_delisted`,
          isFeatured: sql`excluded.is_featured`,
          startTimestamp: sql`excluded.start_timestamp`,
          endTimestamp: sql`excluded.end_timestamp`,
          durationMin: sql`excluded.duration_min`,
          hasInternalRecording: sql`excluded.has_internal_recording`,
          isRecordingPublic: sql`excluded.is_recording_public`,
          numSignups: sql`excluded.num_signups`,
        },
      });
  }

  for (const batch of chunk(workshopInstructorRelations, BATCH_SIZES.workshopInstructors)) {
    await db.insert(workshopInstructors).values(batch).onConflictDoNothing();
  }

  for (const batch of chunk(workshopTagRelations, BATCH_SIZES.workshopTags)) {
    await db.insert(workshopTags).values(batch).onConflictDoNothing();
  }

  logger.info(
    {
      workshops: workshopDataArray.length,
      instructors: instructorMap.size,
      tags: tagMap.size,
    },
    "Workshops saved to database",
  );
}
