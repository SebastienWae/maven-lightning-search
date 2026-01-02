import {
  instructor,
  workshop,
  workshopInstructors,
  workshopTag,
  workshopTags,
} from "@maven-lightning-search/db/schema";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { and, asc, count, desc, eq, exists, inArray, like, or, type SQL, sql } from "drizzle-orm";
import { Logger } from "tslog";
import { z } from "zod";
import { db } from "@/lib/db";

const log = new Logger({ name: "web:utils:talks", type: "json", argumentsArrayName: "messages" });

export type Talk = {
  id: string;
  slug: string;
  title: string;
  description: string;
  isFeatured: boolean;
  status: "Scheduled" | "Live" | "Recorded";
  startTime: Date;
  durationMin: number;
  numSignups: number;
  tags: { id: number; name: string }[];
  instructors: { id: string; name: string; imageUrl: string }[];
};

export type TalksResponse = {
  talks: Talk[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const talksSearchSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
  sortBy: z.enum(["startTime", "duration"]).default("startTime"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().default(""),
  tags: z.array(z.number()).default([]),
  instructors: z.array(z.string()).default([]),
  status: z.array(z.enum(["scheduled", "live", "recorded"])).default([]),
});
export type TalksSearchParams = z.infer<typeof talksSearchSchema>;

export const getTalks = createServerFn({ method: "GET" })
  .inputValidator(talksSearchSchema)
  .handler(async ({ data }): Promise<TalksResponse> => {
    const { page, limit, sortBy, sortOrder, search, tags, instructors, status } = data;

    log.debug("Fetching talks with params", { page, limit, sortBy, sortOrder, search, tags, instructors, status });

    const nowTimestamp = Math.floor(Date.now() / 1000);

    // Build WHERE conditions
    const conditions: SQL[] = [eq(workshop.isCanceled, false)];

    // Text search (case-insensitive on title + description)
    if (search.length > 0) {
      const searchLower = search.toLowerCase();
      const searchCondition = or(
        like(sql`lower(${workshop.title})`, `%${searchLower}%`),
        like(sql`lower(${workshop.description})`, `%${searchLower}%`),
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    // Tag filter (OR - any match)
    if (tags.length > 0) {
      conditions.push(
        exists(
          db
            .select({ x: sql`1` })
            .from(workshopTags)
            .where(and(eq(workshopTags.workshopId, workshop.id), inArray(workshopTags.tagId, tags.map(Number)))),
        ),
      );
    }

    // Instructor filter (OR - any match)
    if (instructors.length > 0) {
      conditions.push(
        exists(
          db
            .select({ x: sql`1` })
            .from(workshopInstructors)
            .where(
              and(
                eq(workshopInstructors.workshopId, workshop.id),
                inArray(workshopInstructors.instructorId, instructors),
              ),
            ),
        ),
      );
    }

    // Status filter (OR logic)
    if (status.length > 0) {
      const statusConditions: SQL[] = [];
      if (status.includes("scheduled")) {
        statusConditions.push(sql`${workshop.startTimestamp} > ${nowTimestamp}`);
      }
      if (status.includes("live")) {
        statusConditions.push(
          sql`${workshop.startTimestamp} <= ${nowTimestamp} AND ${workshop.endTimestamp} >= ${nowTimestamp}`,
        );
      }
      if (status.includes("recorded")) {
        statusConditions.push(sql`${workshop.endTimestamp} < ${nowTimestamp}`);
      }
      if (statusConditions.length > 0) {
        const statusOr = or(...statusConditions);
        if (statusOr) {
          conditions.push(statusOr);
        }
      }
    }

    const whereClause = and(...conditions);

    // Build ORDER BY
    const sortColumn = sortBy === "duration" ? workshop.durationMin : workshop.startTimestamp;
    const orderByClause = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

    // Get total count with same filters
    const [countResult] = await db.select({ total: count() }).from(workshop).where(whereClause);

    const total = countResult?.total ?? 0;

    // Get paginated results
    const offset = (page - 1) * limit;

    const workshops = await db
      .select({
        id: workshop.id,
        slug: workshop.slug,
        title: workshop.title,
        description: workshop.description,
        isFeatured: workshop.isFeatured,
        startTimestamp: workshop.startTimestamp,
        endTimestamp: workshop.endTimestamp,
        durationMin: workshop.durationMin,
        numSignups: workshop.numSignups,
        tags: sql`JSON_GROUP_ARRAY(DISTINCT JSON_OBJECT('id', ${workshopTag.id}, 'name', ${workshopTag.name})) FILTER (WHERE ${workshopTag.id} IS NOT NULL)`.mapWith(
          (value) => JSON.parse(value) as { id: number; name: string }[],
        ),
        instructors:
          sql`JSON_GROUP_ARRAY(DISTINCT JSON_OBJECT('id', ${instructor.id}, 'name', ${instructor.name}, 'imageUrl', ${instructor.imageUrl})) FILTER (WHERE ${instructor.id} IS NOT NULL)`.mapWith(
            (value) => JSON.parse(value) as { id: string; name: string; imageUrl: string }[],
          ),
      })
      .from(workshop)
      .leftJoin(workshopTags, eq(workshopTags.workshopId, workshop.id))
      .leftJoin(workshopTag, eq(workshopTags.tagId, workshopTag.id))
      .leftJoin(workshopInstructors, eq(workshopInstructors.workshopId, workshop.id))
      .leftJoin(instructor, eq(workshopInstructors.instructorId, instructor.id))
      .where(whereClause)
      .groupBy(workshop.id)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    // Transform to Talk[]
    const nowDate = new Date();
    const talks: Talk[] = workshops.map((w) => {
      const startTime = new Date(w.startTimestamp * 1000);
      const endTime = new Date(w.endTimestamp * 1000);

      let talkStatus: Talk["status"];
      if (nowDate < startTime) {
        talkStatus = "Scheduled";
      } else if (nowDate >= startTime && nowDate <= endTime) {
        talkStatus = "Live";
      } else {
        talkStatus = "Recorded";
      }

      return {
        id: String(w.id),
        slug: w.slug,
        title: w.title,
        description: w.description,
        isFeatured: w.isFeatured,
        status: talkStatus,
        startTime,
        durationMin: w.durationMin,
        numSignups: w.numSignups,
        tags: w.tags,
        instructors: w.instructors,
      };
    });

    log.debug(`Fetched ${talks.length} talks (total: ${total})`);

    return {
      talks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  });

export const talksQueryOptions = (params: TalksSearchParams) =>
  queryOptions({
    queryKey: ["talks", params],
    queryFn: () => getTalks({ data: params }),
  });

export const getFilterOptions = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ tags: Talk["tags"]; instructors: Talk["instructors"] }> => {
    log.debug("Fetching filter options");

    const [tags, instructors] = await Promise.all([
      db.select({ id: workshopTag.id, name: workshopTag.name }).from(workshopTag).orderBy(workshopTag.name),
      db
        .select({ id: instructor.id, name: instructor.name, imageUrl: instructor.imageUrl })
        .from(instructor)
        .orderBy(instructor.name),
    ]);

    log.debug(`Fetched ${tags.length} tags and ${instructors.length} instructors`);

    return { tags, instructors };
  },
);

export const filterOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["filterOptions"],
    queryFn: () => getFilterOptions(),
    staleTime: 5 * 60 * 1000,
  });
