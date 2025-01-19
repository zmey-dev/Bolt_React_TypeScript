import { getSupabaseClient } from "../supabase";
import { TABLES } from "../constants";

export async function deleteImages(ids: Array<string>): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase client not initialized");

  try {
    console.log(ids);

    const { error } = await supabase
      .from(TABLES.GALLERY)
      .delete()
      .in("id", ids);
    if (error) throw error;
  } catch (error) {
    console.error("Error deleting gallery:", error);
    throw error;
  }
}

export async function assign_tags_to_images(
  image_ids: Array<string>,
  tag_ids: Array<string>
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase client not initialized");

  console.log("Assigning tags to images:", { image_ids, tag_ids });

  try {
    // Create an array of records to insert
    const records = image_ids.flatMap((image_id) =>
      tag_ids.map((tag_id) => ({ image_id, tag_id }))
    );

    // Perform a bulk insert
    const { error } = await supabase.from(TABLES.IMAGE_TAGS).insert(records);

    if (error) throw error;

    console.log("Tags assigned to images successfully.");
  } catch (error) {
    console.error("Error assigning tags to images:", error);
    throw error;
  }
}
