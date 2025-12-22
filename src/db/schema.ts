import {
	integer,
	primaryKey,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";

// Workshop table - stores workshop data from WorkshopItem and PublishedContentPage
export const workshop = sqliteTable("workshop", {
	id: integer("id").primaryKey(),
	schoolId: integer("school_id").notNull(),
	slug: text("slug").notNull(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	isVisibleOnDiscoveryPage: integer("is_visible_on_discovery_page", {
		mode: "boolean",
	}).notNull(),
	isCanceled: integer("is_canceled", { mode: "boolean" }).notNull(),
	isDelisted: integer("is_delisted", { mode: "boolean" }).notNull(),
	connectedCourseId: integer("connected_course_id"),
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
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
});

// Instructor table - minimal linking table that groups multiple instructor identities
export const instructor = sqliteTable("instructor", {
	id: integer("id").primaryKey({ autoIncrement: true }),
});

// Instructor identities table - stores name + image_url combinations
export const instructorIdentities = sqliteTable("instructor_identities", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	instructorId: integer("instructor_id")
		.notNull()
		.references(() => instructor.id),
	name: text("name").notNull(),
	imageUrl: text("image_url").notNull(),
	createdAt: text("created_at")
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
});

// Workshop instructors junction table - many-to-many relationship
export const workshopInstructors = sqliteTable(
	"workshop_instructors",
	{
		workshopId: integer("workshop_id")
			.notNull()
			.references(() => workshop.id),
		instructorId: integer("instructor_id")
			.notNull()
			.references(() => instructor.id),
	},
	(table) => [primaryKey({ columns: [table.workshopId, table.instructorId] })],
);
