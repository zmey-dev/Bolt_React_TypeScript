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

  try {
    // Log the input data to confirm it's being passed correctly
    console.log("Assigning tags to images:", { image_ids, tag_ids });

    // Create an array of rows to insert
    const rows = image_ids.flatMap((image_id) =>
      tag_ids.map((tag_id) => ({ image_id, tag_id }))
    );

    // Log the rows being inserted
    console.log("Rows to insert into image_tags table:", rows);

    // Insert all rows in a single batch
    const { data, error } = await supabase
      .from(TABLES.IMAGE_TAGS)
      .insert(rows);

    // Log the Supabase response
    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }
    console.log("Tags assigned successfully:", data);
  } catch (error) {
    console.error("Error assigning tags to images:", error);
    throw error;
  }
}