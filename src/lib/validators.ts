import { z } from "zod";
import { normalizePhoneInput, phonePattern } from "@/lib/phone";
import {
  ACTIVITY_REGISTRATION_MAX_MOTIVATION,
  ACTIVITY_REGISTRATION_MAX_PREVIOUS_EXPERIENCE,
} from "@/lib/limits";

const trimInput = (value: unknown) =>
  typeof value === "string" ? value.trim() : value;
const uuid = z.preprocess(trimInput, z.string().uuid());
const datetimeString = z
  .preprocess(trimInput, z.string().min(1))
  .refine(
    (value) => !Number.isNaN(Date.parse(value)),
    "Invalid date and time value.",
  );

const emailString = z.preprocess(trimInput, z.string().email().max(254));

const requiredText = (min: number, max: number, label: string) =>
  z.preprocess(
    trimInput,
    z
      .string()
      .min(min, `${label} is too short.`)
      .max(max, `${label} is too long.`),
  );

const optionalText = (max: number) =>
  z.preprocess(trimInput, z.string().max(max)).optional().or(z.literal(""));

const requiredPhone = z.preprocess(
  normalizePhoneInput,
  z
    .string()
    .regex(
      phonePattern,
      "Phone number must be exactly 10 digits and start with 0.",
    ),
);
const optionalPhone = z
  .preprocess(
    normalizePhoneInput,
    z
      .string()
      .regex(
        phonePattern,
        "Phone number must be exactly 10 digits and start with 0.",
      ),
  )
  .optional()
  .or(z.literal(""));

export const registrationSchema = z.object({
  full_name: requiredText(2, 120, "Full name"),
  email: emailString,
  phone: requiredPhone,
  department_or_school: requiredText(2, 120, "School / department"),
  category_type: z.enum(["collective_sport", "individual_sport", "culture"]),
  event_id: uuid,
  team_name: optionalText(120),
  additional_notes: optionalText(800),
  emergency_contact: optionalText(120),
});

export const registrationBatchSchema = registrationSchema.extend({
  event_ids: z.array(uuid).min(1),
});

export const activityRegistrationSchema = registrationSchema.extend({
  event_id: uuid.optional().or(z.literal("")),
  activity_slug: z.preprocess(
    trimInput,
    z
      .string()
      .min(2)
      .max(80)
      .regex(/^[a-z0-9-]+$/),
  ),
  previous_experience: optionalText(
    ACTIVITY_REGISTRATION_MAX_PREVIOUS_EXPERIENCE,
  ),
  motivation: optionalText(ACTIVITY_REGISTRATION_MAX_MOTIVATION),
  availability_date: z
    .preprocess(trimInput, z.string())
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || !Number.isNaN(Date.parse(value)),
      "Invalid availability date.",
    ),
  preferred_role: optionalText(120),
  registration_details: z.record(z.string(), z.string()).optional(),
});

export const eventSchema = z
  .object({
    title: requiredText(2, 160, "Title"),
    slug: z.preprocess(
      trimInput,
      z
        .string()
        .min(2)
        .max(160)
        .regex(/^[a-z0-9-]+$/),
    ),
    type: z.enum(["sport", "culture", "ceremony", "mini_game"]),
    category: requiredText(2, 120, "Category"),
    venue: requiredText(2, 160, "Venue"),
    starts_at: datetimeString,
    ends_at: datetimeString,
    status: z.enum(["draft", "scheduled", "live", "completed", "cancelled"]),
    description: optionalText(1200),
    sport_id: uuid.optional().or(z.literal("")),
    activity_id: uuid.optional().or(z.literal("")),
    registration_deadline: datetimeString.optional().or(z.literal("")),
    max_participants: z.coerce.number().int().positive().optional(),
    is_registration_open: z.boolean().optional(),
    show_in_schedule: z.boolean().optional(),
    is_featured: z.boolean().optional(),
    visibility: z.enum(["public", "private"]).optional(),
    current_round: optionalText(120),
    icon_key: optionalText(64),
  })
  .refine((value) => Date.parse(value.ends_at) >= Date.parse(value.starts_at), {
    message: "Event end date must be after start date.",
    path: ["ends_at"],
  });

export const matchSchema = z.object({
  event_id: uuid,
  sport: requiredText(2, 120, "Sport"),
  team_a: requiredText(1, 120, "Team A"),
  team_b: requiredText(1, 120, "Team B"),
  score_a: z.coerce.number().int().min(0),
  score_b: z.coerce.number().int().min(0),
  status: z.enum(["scheduled", "live", "completed"]),
  round: requiredText(1, 120, "Round"),
  venue: requiredText(2, 160, "Venue"),
  starts_at: datetimeString,
  team_a_id: uuid.optional().or(z.literal("")),
  team_b_id: uuid.optional().or(z.literal("")),
  event_phase: optionalText(80),
  mvp_player: optionalText(120),
  live_minute: z.coerce.number().int().min(0).optional(),
  is_prediction_locked: z.boolean().optional(),
  notes: optionalText(600),
});

export const resultSchema = z.object({
  event_id: uuid,
  participant_or_team_name: requiredText(1, 160, "Participant / team name"),
  placement: z.coerce.number().int().min(1),
  medal: z.enum(["gold", "silver", "bronze", "none"]),
  score_summary: optionalText(240),
});

export const predictionSchema = z.object({
  match_id: uuid,
  predicted_winner: requiredText(1, 120, "Predicted winner"),
  predicted_score_a: z.coerce.number().int().min(0).default(0),
  predicted_score_b: z.coerce.number().int().min(0).default(0),
  predicted_mvp_player: optionalText(120),
  stake_points: z.coerce.number().int().min(1).max(10).default(1),
});

export const writingSubmissionSchema = z.object({
  title: requiredText(3, 180, "Title"),
  content: requiredText(30, 10000, "Content"),
  category: requiredText(2, 80, "Category"),
});

export const appSettingSchema = z.object({
  key: z.enum([
    "registration_enabled",
    "predictions_enabled",
    "fantasy_launch",
    "writing_enabled",
    "live_streaming_enabled",
    "registration_max_events_per_user",
  ]),
  value: z.union([z.boolean(), z.number().int().min(1).max(20)]),
});

export const profileCompletionSchema = z.object({
  gender: z.preprocess(trimInput, z.enum(["male", "female"])),
});

export const profileUpdateSchema = z.object({
  full_name: requiredText(2, 120, "Full name"),
  school: z.preprocess(
    trimInput,
    z.enum(["ENSIA", "NHSM", "NSNN", "ENSSA", "ENSCS", "ESI", "Others"]),
  ),
  year_of_study: z.preprocess(
    trimInput,
    z.enum(["1", "2", "3", "4", "5", "other"]),
  ),
  student_id: z
    .preprocess(
      trimInput,
      z.string().regex(/^\d{12}$/, "Student ID must be exactly 12 digits."),
    )
    .optional()
    .or(z.literal("")),
  username: z
    .preprocess(trimInput, z.string().regex(/^[a-zA-Z0-9_]{3,32}$/))
    .optional()
    .or(z.literal("")),
  phone: optionalPhone,
  timezone: optionalText(80),
  gender: z.preprocess(trimInput, z.enum(["male", "female"])).optional(),
});

export const sportSchema = z.object({
  name: requiredText(2, 120, "Sport name"),
  slug: z.preprocess(
    trimInput,
    z
      .string()
      .min(2)
      .max(120)
      .regex(/^[a-z0-9-]+$/),
  ),
  sport_type: z.enum(["collective", "individual", "culture"]),
  is_team_based: z.boolean().optional(),
  gender_division: optionalText(40),
  description: optionalText(600),
  is_active: z.boolean().optional(),
});

export const teamSchema = z.object({
  sport_id: uuid,
  name: requiredText(2, 120, "Team name"),
  category: z.preprocess(
    trimInput,
    z.enum(["collective", "individual", "culture"]),
  ),
});
export const teamMembershipSchema = z.object({
  team_id: uuid,
  profile_id: uuid.optional().or(z.literal("")),
  role: requiredText(2, 80, "Role"),
  registration_id: uuid.optional().or(z.literal("")),
  guest_name: z
    .preprocess(trimInput, z.string().max(120))
    .optional()
    .or(z.literal("")),
  guest_email: z
    .preprocess(trimInput, z.string().max(254))
    .optional()
    .or(z.literal("")),
});

export const tournamentSchema = z.object({
  name: requiredText(3, 160, "Tournament name"),
  sport_id: uuid.optional().or(z.literal("")),
  event_id: uuid.optional().or(z.literal("")),
  format: z.enum(["knockout", "group", "league", "hybrid"]),
  status: z.enum(["draft", "scheduled", "live", "completed", "cancelled"]),
  starts_at: datetimeString.optional().or(z.literal("")),
  notes: optionalText(800),
});

export const tournamentAssignmentSchema = z.object({
  tournament_id: uuid,
  team_id: uuid.optional().or(z.literal("")),
});

export const profileAdminUpdateSchema = z.object({
  profile_id: uuid,
  full_name: requiredText(2, 120, "Full name"),
  school: optionalText(120),
  year_of_study: optionalText(20),
  student_id: z
    .preprocess(
      trimInput,
      z.string().regex(/^\d{12}$/, "Student ID must be exactly 12 digits."),
    )
    .optional()
    .or(z.literal("")),
  phone: optionalPhone,
  username: z
    .preprocess(trimInput, z.string().regex(/^[a-zA-Z0-9_]{3,32}$/))
    .optional()
    .or(z.literal("")),
  avatar_url: z.url().optional().or(z.literal("")),
  role: z.enum(["admin", "participant", "viewer"]),
});

export const liveStreamSchema = z.object({
  title: requiredText(3, 160, "Title"),
  description: optionalText(800),
  event_id: uuid.optional().or(z.literal("")),
  playback_url: z.url().optional().or(z.literal("")),
  status: z.enum(["draft", "live", "ended"]),
  access: z.enum(["public", "private"]),
  starts_at: datetimeString.optional().or(z.literal("")),
  ends_at: datetimeString.optional().or(z.literal("")),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
export type RegistrationBatchInput = z.infer<typeof registrationBatchSchema>;
export type ActivityRegistrationInput = z.infer<
  typeof activityRegistrationSchema
>;
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
export type TournamentAssignmentInput = z.infer<
  typeof tournamentAssignmentSchema
>;
export type ProfileAdminUpdateInput = z.infer<typeof profileAdminUpdateSchema>;
export type LiveStreamInput = z.infer<typeof liveStreamSchema>;
