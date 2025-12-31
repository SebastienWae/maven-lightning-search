import { relations } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const workshop = sqliteTable("workshop", {
  id: integer("id").primaryKey(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  isCanceled: integer("is_canceled", { mode: "boolean" }).notNull(),
  isDelisted: integer("is_delisted", { mode: "boolean" }).notNull(),
  isFeatured: integer("is_featured", { mode: "boolean" }).notNull(),
  startDatetime: text("start_datetime").notNull(),
  endDatetime: text("end_datetime").notNull(),
  durationMin: integer("duration_min").notNull(),
  timezone: text("timezone").notNull(),
  hasInternalRecording: integer("has_internal_recording", {
    mode: "boolean",
  }).notNull(),
  isRecordingPublic: integer("is_recording_public", {
    mode: "boolean",
  }).notNull(),
  numSignups: integer("num_signups").notNull(),
});

export const workshopTag = sqliteTable("workshop_tag", {
  id: integer("id").primaryKey(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
});

export const workshopTags = sqliteTable(
  "workshop_tags",
  {
    workshopId: integer("workshop_id")
      .notNull()
      .references(() => workshop.id),
    tagId: integer("tag_id")
      .notNull()
      .references(() => workshopTag.id),
  },
  (table) => [primaryKey({ columns: [table.workshopId, table.tagId] })],
);

export const instructor = sqliteTable("instructor", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
});

export const workshopInstructors = sqliteTable(
  "workshop_instructors",
  {
    workshopId: integer("workshop_id")
      .notNull()
      .references(() => workshop.id),
    instructorId: text("instructor_id")
      .notNull()
      .references(() => instructor.id),
  },
  (table) => [primaryKey({ columns: [table.workshopId, table.instructorId] })],
);

export const workshopRelations = relations(workshop, ({ many }) => ({
  workshopInstructors: many(workshopInstructors),
  workshopTags: many(workshopTags),
}));

export const instructorRelations = relations(instructor, ({ many }) => ({
  workshopInstructors: many(workshopInstructors),
}));

export const workshopTagRelations = relations(workshopTag, ({ many }) => ({
  workshopTags: many(workshopTags),
}));

export const workshopInstructorsRelations = relations(workshopInstructors, ({ one }) => ({
  workshop: one(workshop, {
    fields: [workshopInstructors.workshopId],
    references: [workshop.id],
  }),
  instructor: one(instructor, {
    fields: [workshopInstructors.instructorId],
    references: [instructor.id],
  }),
}));

export const workshopTagsRelations = relations(workshopTags, ({ one }) => ({
  workshop: one(workshop, {
    fields: [workshopTags.workshopId],
    references: [workshop.id],
  }),
  tag: one(workshopTag, {
    fields: [workshopTags.tagId],
    references: [workshopTag.id],
  }),
}));
