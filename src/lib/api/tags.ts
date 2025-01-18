import { getSupabaseClient } from "../supabase";
import { TABLES } from "../constants";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryWithBackoff(operation, retries - 1, delay * 2);
  }
}

export async function getTags(
  galleryTypeId?: string | null
): Promise<string[]> {
  const supabase = await getSupabaseClient();
  if (!supabase) {
    console.warn("Supabase client not initialized");
    return [];
  }

  try {
    return await retryWithBackoff(async () => {
      let query = supabase.from(TABLES.TAGS).select("id, name").order("name");

      if (galleryTypeId) {
        query = query.eq("gallery_type_id", galleryTypeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data?.map((tag) => tag.name) || [];
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
}

export async function createTag(
  name: string,
  galleryTypeId: string
): Promise<void> {
  const supabase = await getSupabaseClient();
  if (!supabase) throw new Error("Supabase client not initialized");

  try {
    return await retryWithBackoff(async () => {
      // First check if tag already exists
      const { data: existingTag, error: checkError } = await supabase
        .from(TABLES.TAGS)
        .select("id")
        .eq("name", name)
        .eq("gallery_type_id", galleryTypeId)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existingTag) return; // Tag already exists

      // Create new tag
      const { error } = await supabase.from(TABLES.TAGS).insert({
        name,
        gallery_type_id: galleryTypeId,
      });

      if (error) throw error;
    });
  } catch (error) {
    console.error("Error creating tag:", error);
    throw error;
  }
}

export async function deleteTag(tag_id: string): Promise<void> {
  const supabase = await getSupabaseClient();
  if (!supabase) throw new Error("Supabase client not initialized");

  try {
    return await retryWithBackoff(async () => {
      // Delete all image_tag associations first
      const { error: unlinkError } = await supabase
        .from(TABLES.IMAGE_TAGS)
        .delete()
        .eq("tag_id", tag_id);

      if (unlinkError) throw unlinkError;

      // Then delete the tag itself
      const { error: deleteError } = await supabase
        .from(TABLES.TAGS)
        .delete()
        .eq("id", tag_id);

      if (deleteError) throw deleteError;
    });
  } catch (error) {
    console.error("Error deleting tag:", error);
    throw error;
  }
}

export async function updateImageTags(
  imageId: string,
  tags: string[],
  galleryTypeId: string
) {
  const supabase = await getSupabaseClient();
  if (!supabase) throw new Error("Supabase client not initialized");

  try {
    return await retryWithBackoff(async () => {
      // First delete all existing image_tags for this image
      const { error: deleteError } = await supabase
        .from(TABLES.IMAGE_TAGS)
        .delete()
        .eq("image_id", imageId);

      if (deleteError) throw deleteError;

      if (tags.length > 0) {
        // Get or create tags one by one to avoid conflicts
        for (const tagName of tags) {
          // First try to get existing tag
          const { data: existingTags, error: selectError } = await supabase
            .from(TABLES.TAGS)
            .select("id")
            .eq("name", tagName)
            .eq("gallery_type_id", galleryTypeId)
            .limit(1);

          if (selectError) throw selectError;

          let tagId;
          if (existingTags && existingTags.length > 0) {
            tagId = existingTags[0].id;
          } else {
            // If tag doesn't exist, create it
            const { data: newTag, error: insertError } = await supabase
              .from(TABLES.TAGS)
              .insert({
                name: tagName,
                gallery_type_id: galleryTypeId,
              })
              .select("id")
              .single();

            if (insertError && insertError.code !== "23505") {
              // Ignore duplicate key errors
              throw insertError;
            }
            tagId = newTag?.id;
          }

          if (tagId) {
            // Create image_tag association
            const { error: linkError } = await supabase
              .from(TABLES.IMAGE_TAGS)
              .insert({
                image_id: imageId,
                tag_id: tagId,
              });

            if (linkError && linkError.code !== "23505") {
              // Ignore duplicate key errors
              throw linkError;
            }
          }
        }
      }

      return true;
    });
  } catch (error) {
    console.error("Error updating image tags:", error);
    throw error;
  }
}
