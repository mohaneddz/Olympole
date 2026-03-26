import { z } from "zod";

export const registrationSchema = z.object({
  full_name: z.string().min(2).max(120),
  email: z.email(),
  phone: z.string().min(6).max(30),
  department_or_school: z.string().min(2).max(120),
  category_type: z.enum(["collective_sport", "individual_sport", "culture"]),
  event_id: z.uuid(),
  team_name: z.string().max(120).optional().or(z.literal("")),
  additional_notes: z.string().max(800).optional().or(z.literal("")),
});

export const eventSchema = z.object({
  title: z.string().min(2).max(160),
  slug: z
    .string()
    .min(2)
    .max(160)
    .regex(/^[a-z0-9-]+$/),
  type: z.enum(["sport", "culture", "ceremony", "mini_game"]),
  category: z.string().min(2).max(120),
  venue: z.string().min(2).max(160),
  starts_at: z.iso.datetime(),
  ends_at: z.iso.datetime(),
  status: z.enum(["draft", "scheduled", "live", "completed", "cancelled"]),
  description: z.string().max(1200).optional().or(z.literal("")),
});

export const matchSchema = z.object({
  event_id: z.uuid(),
  sport: z.string().min(2).max(120),
  team_a: z.string().min(1).max(120),
  team_b: z.string().min(1).max(120),
  score_a: z.coerce.number().int().min(0),
  score_b: z.coerce.number().int().min(0),
  status: z.enum(["scheduled", "live", "completed"]),
  round: z.string().min(1).max(120),
  venue: z.string().min(2).max(160),
  starts_at: z.iso.datetime(),
});

export const resultSchema = z.object({
  event_id: z.uuid(),
  participant_or_team_name: z.string().min(1).max(160),
  placement: z.coerce.number().int().min(1),
  medal: z.enum(["gold", "silver", "bronze", "none"]),
  score_summary: z.string().max(240).optional().or(z.literal("")),
});

export const predictionSchema = z.object({
  match_id: z.uuid(),
  predicted_winner: z.string().min(1).max(120),
});

export const writingSubmissionSchema = z.object({
  title: z.string().min(3).max(180),
  content: z.string().min(30).max(10000),
  category: z.string().min(2).max(80),
});

export const appSettingSchema = z.object({
  key: z.enum(["registration_enabled", "predictions_enabled", "writing_enabled"]),
  value: z.boolean(),
});

export const profileCompletionSchema = z.object({
  full_name: z.string().min(2).max(120),
  school: z.enum(["ENSIA", "NHSM", "NHCS", "Others"]),
  year_of_study: z.enum(["1", "2", "3", "4", "5", "other"]),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type MatchInput = z.infer<typeof matchSchema>;
export type ResultInput = z.infer<typeof resultSchema>;
export type PredictionInput = z.infer<typeof predictionSchema>;
export type WritingSubmissionInput = z.infer<typeof writingSubmissionSchema>;
export type ProfileCompletionInput = z.infer<typeof profileCompletionSchema>;
