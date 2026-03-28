"use server";

import { revalidatePath } from "next/cache";
import { failure, success, type ActionResponse } from "@/lib/actions";
import { getCurrentUser, requireAdmin, requireAuth } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { writingSubmissionSchema } from "@/lib/validators";

export async function submitWritingAction(_: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const user = await requireAuth();

  const parsed = writingSubmissionSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    category: formData.get("category"),
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Invalid writing submission.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("writing_submissions").insert({
    user_id: user.id,
    ...parsed.data,
    status: "draft",
  });

  if (error) {
    return failure(error.message);
  }

  revalidatePath("/culture/writing");
  revalidatePath("/admin/events");
  return success("Submission saved. Pending admin publication.");
}

export async function voteSubmissionAction(formData: FormData) {
  const user = await requireAuth();
  const submissionId = String(formData.get("submission_id") ?? "");
  if (!submissionId) {
    return failure("Missing submission id.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("submission_votes").insert({
    submission_id: submissionId,
    voter_user_id: user.id,
  });

  if (error) {
    return failure(error.message.includes("duplicate key") ? "You already voted for this submission." : error.message);
  }

  revalidatePath("/culture/writing");
  return success("Vote submitted.");
}

export async function voteSubmissionWithStateAction(
  _: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  return voteSubmissionAction(formData);
}

export async function moderateWritingAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const featured = String(formData.get("is_featured") ?? "false") === "true";

  if (!id || !["draft", "published", "rejected"].includes(status)) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("writing_submissions").update({ status, is_featured: featured }).eq("id", id);
  if (error) {
    return;
  }

  const admin = await getCurrentUser();
  if (admin) {
    await supabase.from("admin_activity_logs").insert({
      admin_user_id: admin.id,
      action: `writing_${status}`,
      entity_type: "writing_submission",
      entity_id: id,
    });
  }

  revalidatePath("/culture/writing");
  revalidatePath("/admin/events");
}
