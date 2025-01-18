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
