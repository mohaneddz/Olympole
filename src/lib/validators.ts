import { z } from "zod";

const uuid = z.string().uuid();
const datetimeString = z
  .string()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date and time value.");

export const registrationSchema = z.object({
  full_name: z.string().min(2).max(120),
  email: z.email(),
  phone: z.string().min(6).max(30),
  department_or_school: z.string().min(2).max(120),
  category_type: z.enum(["collective_sport", "individual_sport", "culture"]),
  event_id: uuid,
  team_name: z.string().max(120).optional().or(z.literal("")),
  additional_notes: z.string().max(800).optional().or(z.literal("")),
  emergency_contact: z.string().max(120).optional().or(z.literal("")),
});

export const registrationBatchSchema = registrationSchema.extend({
  event_ids: z.array(uuid).min(1).max(8),
});

export const activityRegistrationSchema = registrationSchema.extend({
  activity_slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/),
  previous_experience: z.string().min(8).max(1000),
  motivation: z.string().min(20).max(1200),
  availability_date: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), "Invalid availability date."),
  preferred_role: z.string().max(120).optional().or(z.literal("")),
  registration_details: z.record(z.string(), z.string()).optional(),
});

export const eventSchema = z
  .object({
    title: z.string().min(2).max(160),
    slug: z
      .string()
      .min(2)
      .max(160)
      .regex(/^[a-z0-9-]+$/),
    type: z.enum(["sport", "culture", "ceremony", "mini_game"]),
    category: z.string().min(2).max(120),
    venue: z.string().min(2).max(160),
    starts_at: datetimeString,
    ends_at: datetimeString,
    status: z.enum(["draft", "scheduled", "live", "completed", "cancelled"]),
    description: z.string().max(1200).optional().or(z.literal("")),
    sport_id: uuid.optional().or(z.literal("")),
    registration_deadline: datetimeString.optional().or(z.literal("")),
    max_participants: z.coerce.number().int().positive().optional(),
    is_registration_open: z.boolean().optional(),
    is_featured: z.boolean().optional(),
    visibility: z.enum(["public", "private"]).optional(),
    current_round: z.string().max(120).optional().or(z.literal("")),
    icon_key: z.string().max(64).optional().or(z.literal("")),
  })
  .refine((value) => Date.parse(value.ends_at) >= Date.parse(value.starts_at), {
    message: "Event end date must be after start date.",
    path: ["ends_at"],
  });

export const matchSchema = z.object({
  event_id: uuid,
  sport: z.string().min(2).max(120),
  team_a: z.string().min(1).max(120),
  team_b: z.string().min(1).max(120),
  score_a: z.coerce.number().int().min(0),
  score_b: z.coerce.number().int().min(0),
  status: z.enum(["scheduled", "live", "completed"]),
  round: z.string().min(1).max(120),
  venue: z.string().min(2).max(160),
  starts_at: datetimeString,
  team_a_id: uuid.optional().or(z.literal("")),
  team_b_id: uuid.optional().or(z.literal("")),
  event_phase: z.string().max(80).optional().or(z.literal("")),
  mvp_player: z.string().max(120).optional().or(z.literal("")),
  live_minute: z.coerce.number().int().min(0).optional(),
  is_prediction_locked: z.boolean().optional(),
  notes: z.string().max(600).optional().or(z.literal("")),
});

export const resultSchema = z.object({
  event_id: uuid,
  participant_or_team_name: z.string().min(1).max(160),
  placement: z.coerce.number().int().min(1),
  medal: z.enum(["gold", "silver", "bronze", "none"]),
  score_summary: z.string().max(240).optional().or(z.literal("")),
});

export const predictionSchema = z.object({
  match_id: uuid,
  predicted_winner: z.string().min(1).max(120),
  predicted_score_a: z.coerce.number().int().min(0).default(0),
  predicted_score_b: z.coerce.number().int().min(0).default(0),
  predicted_mvp_player: z.string().max(120).optional().or(z.literal("")),
  stake_points: z.coerce.number().int().min(1).max(10).default(1),
});

export const writingSubmissionSchema = z.object({
  title: z.string().min(3).max(180),
  content: z.string().min(30).max(10000),
  category: z.string().min(2).max(80),
});

export const appSettingSchema = z.object({
  key: z.enum([
    "registration_enabled",
    "predictions_enabled",
    "writing_enabled",
    "live_streaming_enabled",
    "registration_max_events_per_user",
  ]),
  value: z.union([z.boolean(), z.number().int().min(1).max(20)]),
});

export const profileCompletionSchema = z.object({
  full_name: z.string().min(2).max(120),
  school: z.enum(["ENSIA", "NHSM", "NHCS", "Others"]),
  year_of_study: z.enum(["1", "2", "3", "4", "5", "other"]),
});

export const profileUpdateSchema = profileCompletionSchema.extend({
  username: z
    .string()
    .regex(/^[a-zA-Z0-9_]{3,32}$/)
    .optional()
    .or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  bio: z.string().max(400).optional().or(z.literal("")),
  timezone: z.string().max(80).optional().or(z.literal("")),
});

export const sportSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/),
  sport_type: z.enum(["collective", "individual", "culture"]),
  is_team_based: z.boolean().optional(),
  gender_division: z.string().max(40).optional().or(z.literal("")),
  description: z.string().max(600).optional().or(z.literal("")),
  is_active: z.boolean().optional(),
});

export const teamSchema = z.object({
  sport_id: uuid,
  name: z.string().min(2).max(120),
  short_code: z.string().max(10).optional().or(z.literal("")),
  city: z.string().max(120).optional().or(z.literal("")),
  coach_name: z.string().max(120).optional().or(z.literal("")),
});

export const teamMembershipSchema = z.object({
  team_id: uuid,
  profile_id: uuid,
  role: z.string().min(2).max(80),
  registration_id: uuid.optional().or(z.literal("")),
});

export const tournamentSchema = z.object({
  name: z.string().min(3).max(160),
  sport_id: uuid.optional().or(z.literal("")),
  event_id: uuid.optional().or(z.literal("")),
  format: z.enum(["knockout", "group", "league", "hybrid"]),
  status: z.enum(["draft", "scheduled", "live", "completed", "cancelled"]),
  starts_at: datetimeString.optional().or(z.literal("")),
  notes: z.string().max(800).optional().or(z.literal("")),
});

export const tournamentAssignmentSchema = z.object({
  tournament_id: uuid,
  team_id: uuid.optional().or(z.literal("")),
});

export const profileAdminUpdateSchema = z.object({
  profile_id: uuid,
  full_name: z.string().min(2).max(120),
  school: z.string().max(120).optional().or(z.literal("")),
  year_of_study: z.string().max(20).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  username: z
    .string()
    .regex(/^[a-zA-Z0-9_]{3,32}$/)
    .optional()
    .or(z.literal("")),
  avatar_url: z.url().optional().or(z.literal("")),
  role: z.enum(["admin", "participant", "viewer"]),
});

export const liveStreamSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().max(800).optional().or(z.literal("")),
  event_id: uuid.optional().or(z.literal("")),
  playback_url: z.url().optional().or(z.literal("")),
  status: z.enum(["draft", "live", "ended"]),
  access: z.enum(["public", "private"]),
  starts_at: datetimeString.optional().or(z.literal("")),
  ends_at: datetimeString.optional().or(z.literal("")),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
export type RegistrationBatchInput = z.infer<typeof registrationBatchSchema>;
export type ActivityRegistrationInput = z.infer<typeof activityRegistrationSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type MatchInput = z.infer<typeof matchSchema>;
export type ResultInput = z.infer<typeof resultSchema>;
export type PredictionInput = z.infer<typeof predictionSchema>;
export type WritingSubmissionInput = z.infer<typeof writingSubmissionSchema>;
export type ProfileCompletionInput = z.infer<typeof profileCompletionSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type SportInput = z.infer<typeof sportSchema>;
export type TeamInput = z.infer<typeof teamSchema>;
export type TeamMembershipInput = z.infer<typeof teamMembershipSchema>;
export type TournamentInput = z.infer<typeof tournamentSchema>;
export type TournamentAssignmentInput = z.infer<typeof tournamentAssignmentSchema>;
export type ProfileAdminUpdateInput = z.infer<typeof profileAdminUpdateSchema>;
export type LiveStreamInput = z.infer<typeof liveStreamSchema>;
