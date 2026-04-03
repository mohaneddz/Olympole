"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { failure, success, type ActionResponse } from "@/lib/actions";
import { getCurrentUserRoles, requireAuth } from "@/lib/auth";
import { PROFILE_DRAFT_COOKIE } from "@/lib/cookie-drafts";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { profileCompletionSchema, profileUpdateSchema } from "@/lib/validators";

const PROFILE_AVATAR_BUCKETS = ["profile-pfps", "avatars"] as const;

function extractStorageObjectFromPublicUrl(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    const marker = "/storage/v1/object/public/";
    const markerIndex = parsed.pathname.indexOf(marker);
    if (markerIndex !== -1) {
      const rest = parsed.pathname.slice(markerIndex + marker.length);
      const [bucket, ...encodedPathParts] = rest.split("/");
      if (!bucket || encodedPathParts.length === 0) {
        return null;
      }
      return {
        bucket,
        path: decodeURIComponent(encodedPathParts.join("/")),
      };
    }
  } catch {
    // Fallback for legacy stored values like "bucket/path/to/file.webp"
  }

  const [bucket, ...pathParts] = url.split("/");
  if (!bucket || pathParts.length === 0) {
    return null;
  }

  return { bucket, path: pathParts.join("/") };
}

function isBucketMissingError(message: string) {
  const lowered = message.toLowerCase();
  return lowered.includes("bucket not found") || lowered.includes("does not exist");
}

async function ensureAvatarBucket(adminSupabase: ReturnType<typeof createSupabaseAdminClient>, bucket: string) {
  const { error } = await adminSupabase.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/webp"],
  });

  if (!error) {
    return true;
  }

  const lowered = error.message.toLowerCase();
  if (lowered.includes("already exists") || lowered.includes("duplicate")) {
    return true;
  }

  return false;
}

async function uploadAvatarWithFallback(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  adminSupabase: ReturnType<typeof createSupabaseAdminClient> | null,
  userId: string,
  avatarFile: File
) {
  const storageClient = adminSupabase ?? supabase;
  const newAvatarPath = `${userId}/avatar-${Date.now()}.webp`;
  let uploadedToBucket: string | null = null;
  let nextAvatarUrl: string | null = null;
  let lastUploadErrorMessage = "Unknown upload error.";

  for (const bucket of PROFILE_AVATAR_BUCKETS) {
    let { error: uploadError } = await storageClient.storage
      .from(bucket)
      .upload(newAvatarPath, avatarFile, {
        contentType: "image/webp",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError && isBucketMissingError(uploadError.message) && adminSupabase) {
      const bucketReady = await ensureAvatarBucket(adminSupabase, bucket);
      if (bucketReady) {
        const retry = await adminSupabase.storage
          .from(bucket)
          .upload(newAvatarPath, avatarFile, {
            contentType: "image/webp",
            cacheControl: "3600",
            upsert: false,
          });
        uploadError = retry.error;
      }
    }

    if (!uploadError) {
      const { data: publicUrlData } = storageClient.storage.from(bucket).getPublicUrl(newAvatarPath);
      nextAvatarUrl = publicUrlData.publicUrl;
      uploadedToBucket = bucket;
      break;
    }

    lastUploadErrorMessage = uploadError.message;
    if (!isBucketMissingError(uploadError.message)) {
      break;
    }
  }

  return { uploadedToBucket, newAvatarPath, nextAvatarUrl, lastUploadErrorMessage };
}

export async function completeProfileAction(_: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const user = await requireAuth();

  const parsed = profileCompletionSchema.safeParse({
    full_name: formData.get("full_name"),
    school: formData.get("school"),
    year_of_study: formData.get("year_of_study"),
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Invalid profile details.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      school: parsed.data.school,
      year_of_study: parsed.data.year_of_study,
    })
    .eq("id", user.id);

  if (error) {
    return failure(`Failed to save profile: ${error.message}`);
  }

  (await cookies()).delete(PROFILE_DRAFT_COOKIE);

  const roles = await getCurrentUserRoles();
  if (roles.includes("admin")) {
    redirect("/admin");
  }

  redirect("/profile");
}

export async function updateProfileAction(_: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const user = await requireAuth();
  const avatarFile = formData.get("avatar");
  let adminSupabase: ReturnType<typeof createSupabaseAdminClient> | null = null;

  try {
    adminSupabase = createSupabaseAdminClient();
  } catch {
    adminSupabase = null;
  }

  const parsed = profileUpdateSchema.safeParse({
    full_name: formData.get("full_name"),
    school: formData.get("school"),
    year_of_study: formData.get("year_of_study"),
    username: formData.get("username"),
    phone: formData.get("phone"),
    bio: formData.get("bio"),
    timezone: formData.get("timezone"),
  });

  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Invalid profile update payload.");
  }

  const supabase = await createSupabaseServerClient();
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  const currentAvatarObject = extractStorageObjectFromPublicUrl(existingProfile?.avatar_url);
  let nextAvatarUrl = existingProfile?.avatar_url ?? null;
  let uploadedToBucket: string | null = null;
  let newAvatarPath: string | null = null;

  if (avatarFile instanceof File && avatarFile.size > 0) {
    if (avatarFile.type !== "image/webp") {
      return failure("Avatar must be uploaded as .webp format.");
    }

    if (avatarFile.size > 5 * 1024 * 1024) {
      return failure("Avatar is too large. Maximum allowed size is 5MB.");
    }

    const uploadResult = await uploadAvatarWithFallback(supabase, adminSupabase, user.id, avatarFile);
    uploadedToBucket = uploadResult.uploadedToBucket;
    newAvatarPath = uploadResult.newAvatarPath;
    nextAvatarUrl = uploadResult.nextAvatarUrl ?? nextAvatarUrl;

    if (!uploadedToBucket) {
      return failure(`Failed to upload avatar: ${uploadResult.lastUploadErrorMessage}.`);
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      school: parsed.data.school,
      year_of_study: parsed.data.year_of_study,
      username: parsed.data.username || null,
      phone: parsed.data.phone || null,
      bio: parsed.data.bio || null,
      timezone: parsed.data.timezone || "Africa/Algiers",
      avatar_url: nextAvatarUrl,
    })
    .eq("id", user.id);

  if (error) {
    if (uploadedToBucket && newAvatarPath) {
      const storageClient = adminSupabase ?? supabase;
      await storageClient.storage.from(uploadedToBucket).remove([newAvatarPath]);
    }
    return failure(`Failed to update profile: ${error.message}`);
  }

  if (
    uploadedToBucket &&
    newAvatarPath &&
    currentAvatarObject &&
    !(currentAvatarObject.bucket === uploadedToBucket && currentAvatarObject.path === newAvatarPath)
  ) {
    const storageClient = adminSupabase ?? supabase;
    await storageClient.storage.from(currentAvatarObject.bucket).remove([currentAvatarObject.path]);
  }

  revalidatePath("/profile");

  return success("Profile updated successfully.");
}

export async function uploadProfileAvatarAction(_: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const user = await requireAuth();
  const avatarFile = formData.get("avatar");

  if (!(avatarFile instanceof File) || avatarFile.size === 0) {
    return failure("Please select an avatar image.");
  }

  if (avatarFile.type !== "image/webp") {
    return failure("Avatar must be uploaded as .webp format.");
  }

  if (avatarFile.size > 5 * 1024 * 1024) {
    return failure("Avatar is too large. Maximum allowed size is 5MB.");
  }

  const supabase = await createSupabaseServerClient();
  let adminSupabase: ReturnType<typeof createSupabaseAdminClient> | null = null;

  try {
    adminSupabase = createSupabaseAdminClient();
  } catch {
    adminSupabase = null;
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  const currentAvatarObject = extractStorageObjectFromPublicUrl(existingProfile?.avatar_url);
  const uploadResult = await uploadAvatarWithFallback(supabase, adminSupabase, user.id, avatarFile);

  if (!uploadResult.uploadedToBucket || !uploadResult.nextAvatarUrl) {
    return failure(`Failed to upload avatar: ${uploadResult.lastUploadErrorMessage}.`);
  }

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: uploadResult.nextAvatarUrl })
    .eq("id", user.id);

  if (error) {
    const storageClient = adminSupabase ?? supabase;
    await storageClient.storage.from(uploadResult.uploadedToBucket).remove([uploadResult.newAvatarPath]);
    return failure(`Failed to update avatar: ${error.message}`);
  }

  if (
    currentAvatarObject &&
    !(currentAvatarObject.bucket === uploadResult.uploadedToBucket && currentAvatarObject.path === uploadResult.newAvatarPath)
  ) {
    const storageClient = adminSupabase ?? supabase;
    await storageClient.storage.from(currentAvatarObject.bucket).remove([currentAvatarObject.path]);
  }

  revalidatePath("/profile");
  return success("Avatar updated successfully.");
}
