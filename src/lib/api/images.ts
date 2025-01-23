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

export async function remove_tags_from_images(
  image_ids: Array<string>,
  tag_ids: Array<string>
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase client not initialized");

  try {
    // Log the input data to confirm it's being passed correctly
    console.log("Removing tags from images:", { image_ids, tag_ids });

    // Create an array of pairs to remove
    const pairsToRemove = image_ids.flatMap((image_id) =>
      tag_ids.map((tag_id) => ({ image_id, tag_id }))
    );

    // Log the pairs to remove
    console.log("Pairs to remove from image_tags table:", pairsToRemove);

    // Check if there are pairs to remove
    if (pairsToRemove.length === 0) {
      console.warn("No pairs to remove. Exiting function.");
      return;
    }

    // Fetch existing (image_id, tag_id) pairs from the database
    const { data: existingPairs, error: fetchError } = await supabase
      .from(TABLES.IMAGE_TAGS)
      .select("image_id, tag_id")
      .in(
        "image_id",
        pairsToRemove.map((pair) => pair.image_id)
      )
      .in(
        "tag_id",
        pairsToRemove.map((pair) => pair.tag_id)
      );

    if (fetchError) {
      console.error("Error fetching existing pairs:", fetchError);
      throw fetchError;
    }

    // Log existing pairs for debugging
    console.log("Existing (image_id, tag_id) pairs:", existingPairs);

    // Filter pairs that exist in the database
    const pairsToDelete = pairsToRemove.filter((pair) =>
      existingPairs.some(
        (existingPair) =>
          existingPair.image_id === pair.image_id &&
          existingPair.tag_id === pair.tag_id
      )
    );

    // Log the pairs to delete
    console.log("Pairs to delete:", pairsToDelete);

    // Check if there are pairs to delete
    if (pairsToDelete.length === 0) {
      console.warn("No matching pairs found to delete.");
      return;
    }

    // Delete the matching pairs
    const { error: deleteError } = await supabase
      .from(TABLES.IMAGE_TAGS)
      .delete()
      .in(
        "image_id",
        pairsToDelete.map((pair) => pair.image_id)
      )
      .in(
        "tag_id",
        pairsToDelete.map((pair) => pair.tag_id)
      );

    // Log the Supabase response
    if (deleteError) {
      console.error("Supabase error:", deleteError);
      throw deleteError;
    }

    console.log("Tags removed successfully.");
  } catch (error) {
    console.error("Error removing tags from images:", error);
    throw error; // Re-throw the error to handle it at a higher level
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

    // Create an array of rows to insert using flatMap
    const rows = image_ids.flatMap((image_id) =>
      tag_ids.map((tag_id) => ({ image_id, tag_id }))
    );

    // Log the rows being inserted
    console.log("Rows to insert into image_tags table:", rows);

    // Check if there are rows to insert
    if (rows.length === 0) {
      console.warn("No rows to insert. Exiting function.");
      return;
    }

    // Fetch existing (image_id, tag_id) pairs from the database
    const { data: existingPairs, error: fetchError } = await supabase
      .from(TABLES.IMAGE_TAGS)
      .select("image_id, tag_id")
      .in(
        "image_id",
        rows.map((row) => row.image_id)
      )
      .in(
        "tag_id",
        rows.map((row) => row.tag_id)
      );

    if (fetchError) {
      console.error("Error fetching existing pairs:", fetchError);
      throw fetchError;
    }

    // Log existing pairs for debugging
    console.log("Existing (image_id, tag_id) pairs:", existingPairs);

    // Filter out rows that already exist in the database
    const uniqueRows = rows.filter((row) => {
      return !existingPairs.some(
        (pair) => pair.image_id === row.image_id && pair.tag_id === row.tag_id
      );
    });

    // Log the filtered rows
    console.log("Unique rows to insert:", uniqueRows);

    // Check if there are unique rows to insert
    if (uniqueRows.length === 0) {
      console.warn("All tags already assigned. No new rows to insert.");
      return;
    }

    // Insert only the unique rows
    const { data, error } = await supabase
      .from(TABLES.IMAGE_TAGS)
      .insert(uniqueRows)
      .select(); // Use .select() to return the inserted data

    // Log the Supabase response
    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    console.log("Tags assigned successfully:", data);
  } catch (error) {
    console.error("Error assigning tags to images:", error);
    throw error; // Re-throw the error to handle it at a higher level
  }
}
