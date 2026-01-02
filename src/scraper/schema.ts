import { z } from "zod";

const WorkshopTagSchema = z.object({
  id: z.number(),
  tag_type: z.string().nullable().optional(),
  label: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  description: z.string().nullable(),
  parent_tag_id: z.number().nullable(),
});

const InstructorInfoSchema = z.object({
  name: z.string().trim().min(1),
  uuid: z.string().nullable().optional(),
  logos: z
    .object({
      label: z.string().nullable().optional(),
      logos: z.array(z.string()),
    })
    .nullable()
    .optional(),
  title: z.string().nullable().optional(),
  bio_html: z.string().nullable().optional(),
  headline: z.string().nullable().optional(),
  image_url: z.string().trim().min(1),
  highlights: z.array(z.string()).nullable().optional(),
  linkedin_url: z.string().nullable().optional(),
  twitter_handle: z.string().nullable().optional(),
  highlights_html: z.string().nullable().optional(),
  image_url_no_bg: z.string().nullable().optional(),
  custom_social_link: z.string().nullable().optional(),
});

const LearningOutcomeSchema = z.object({
  uuid: z.string().nullable().optional(),
  title: z.string(),
  description: z.string(),
});

const PublishedContentPageSectionSchema = z.object({
  uuid: z.string().nullable().optional(),
  title: z.string().trim().min(1),
  version: z.number(),
  image_url: z.string().trim().min(1),
  is_visible: z.boolean(),
  topic_desc: z.string().trim().min(1),
  brand_logos: z.object({
    label: z.string().trim().nullable().optional(),
    logos: z.array(z.union([z.string(), z.looseObject({})])),
  }),
  section_type: z.string().trim().min(1),
  instructor_infos: z.array(InstructorInfoSchema),
  learning_outcomes: z.array(LearningOutcomeSchema),
});

const SchoolEventSchema = z.object({
  id: z.number(),
  slug: z.string().nullable(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  start_datetime: z.string().trim().min(1),
  end_datetime: z.string().trim().min(1),
  start_date: z.string().nullable().optional(),
  start_time: z.string().nullable().optional(),
  duration_min: z.number(),
  timezone: z.string().nullable().optional(),
  has_internal_recording: z.boolean(),
  is_recording_public: z.boolean(),
});

const PublishedContentPageSchema = z.object({
  id: z.number(),
  school_id: z.number(),
  slug: z.string().trim().min(1),
  content_page_type: z.string().nullable().optional(),
  sections: z.array(PublishedContentPageSectionSchema),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
  theme: z.string().nullable(),
  attrs: z.object({
    type: z.string().nullable().optional(),
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
  tag_slug: z.string().nullable().optional(),
});

export type WorkshopTag = z.infer<typeof WorkshopTagSchema>;
export type InstructorInfo = z.infer<typeof InstructorInfoSchema>;
export type LearningOutcome = z.infer<typeof LearningOutcomeSchema>;
export type PublishedContentPageSection = z.infer<typeof PublishedContentPageSectionSchema>;
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
