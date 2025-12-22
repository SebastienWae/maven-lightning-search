import { z } from "zod";

const WorkshopTagSchema = z.object({
	id: z.number(),
	tag_type: z.string(),
	label: z.string(),
	slug: z.string(),
	description: z.string().nullable(),
	parent_tag_id: z.number().nullable(),
});

const InstructorInfoSchema = z.object({
	name: z.string(),
	uuid: z.string(),
	logos: z
		.object({
			label: z.string(),
			logos: z.array(z.string()),
		})
		.nullable()
		.optional(),
	title: z.string(),
	bio_html: z.string(),
	headline: z.string().nullable().optional(),
	image_url: z.string(),
	highlights: z.array(z.string()).nullable().optional(),
	linkedin_url: z.string().nullable().optional(),
	twitter_handle: z.string().nullable().optional(),
	highlights_html: z.string().nullable().optional(),
	image_url_no_bg: z.string().nullable().optional(),
	custom_social_link: z.string().nullable().optional(),
});

const LearningOutcomeSchema = z.object({
	uuid: z.string(),
	title: z.string(),
	description: z.string(),
});

const PublishedContentPageSectionSchema = z.object({
	uuid: z.string(),
	title: z.string(),
	version: z.number(),
	image_url: z.string(),
	is_visible: z.boolean(),
	topic_desc: z.string(),
	brand_logos: z.object({
		label: z.string(),
		logos: z.array(z.union([z.string(), z.looseObject({})])),
	}),
	section_type: z.string(),
	instructor_infos: z.array(InstructorInfoSchema),
	learning_outcomes: z.array(LearningOutcomeSchema),
});

const SchoolEventSchema = z.object({
	id: z.number(),
	slug: z.string().nullable(),
	title: z.string(),
	description: z.string(),
	start_datetime: z.string(),
	end_datetime: z.string(),
	start_date: z.string(),
	start_time: z.string(),
	duration_min: z.number(),
	timezone: z.string(),
	has_internal_recording: z.boolean(),
	is_recording_public: z.boolean(),
});

const PublishedContentPageSchema = z.object({
	id: z.number(),
	school_id: z.number(),
	slug: z.string(),
	content_page_type: z.string(),
	sections: z.array(PublishedContentPageSectionSchema),
	created_at: z.string(),
	updated_at: z.string(),
	theme: z.string().nullable(),
	attrs: z.object({
		type: z.string(),
		is_canceled: z.boolean().nullable(),
		is_delisted: z.boolean().nullable(),
		connected_course_id: z.number().nullable(),
		course_stripe_promo_code_id: z.union([z.number(), z.string()]).nullable(),
	}),
	school_event: SchoolEventSchema,
	num_signups: z.number(),
});

const WorkshopItemSchema = z.object({
	id: z.number(),
	school_id: z.number(),
	is_visible_on_discovery_page: z.boolean(),
	is_canceled: z.boolean(),
	is_delisted: z.boolean(),
	connected_course_id: z.number().nullable(),
	workshop_tags: z.array(WorkshopTagSchema),
	published_content_page: PublishedContentPageSchema,
});

const ApiMetadataSchema = z.object({
	total: z.number(),
	page: z.number(),
	pages: z.number(),
});

const ApiResponseSchema = z.object({
	items: z.array(WorkshopItemSchema),
	metadata: ApiMetadataSchema,
	tag_id: z.number().nullable(),
	tag_slug: z.string(),
});

export type WorkshopTag = z.infer<typeof WorkshopTagSchema>;
export type InstructorInfo = z.infer<typeof InstructorInfoSchema>;
export type LearningOutcome = z.infer<typeof LearningOutcomeSchema>;
export type PublishedContentPageSection = z.infer<
	typeof PublishedContentPageSectionSchema
>;
export type SchoolEvent = z.infer<typeof SchoolEventSchema>;
export type PublishedContentPage = z.infer<typeof PublishedContentPageSchema>;
export type WorkshopItem = z.infer<typeof WorkshopItemSchema>;
export type ApiMetadata = z.infer<typeof ApiMetadataSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;

export {
	WorkshopTagSchema,
	InstructorInfoSchema,
	LearningOutcomeSchema,
	PublishedContentPageSectionSchema,
	SchoolEventSchema,
	PublishedContentPageSchema,
	WorkshopItemSchema,
	ApiMetadataSchema,
	ApiResponseSchema,
};
