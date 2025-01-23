import { getSupabaseClient } from "../supabase";
import { TABLES } from "../constants";
import type { GalleryImage } from "../../types";

const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 1000;
const MAX_BACKOFF = 10000;

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = INITIAL_BACKOFF
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries === 0) throw error;
    const nextDelay = Math.min(delay * 2, MAX_BACKOFF);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithBackoff(operation, retries - 1, nextDelay);
  }
}

export async function loadGalleryImages(): Promise<GalleryImage[]> {
  return retryWithBackoff(async () => {
    const supabase = await getSupabaseClient();
    if (!supabase) {
      console.error('Failed to initialize Supabase client');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from(TABLES.GALLERY)
        .select(`
          *,
          gallery_types (
            id,
            name
          ),
          image_tags (
            tags (
              id,
              name
            )
          )
        `)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Gallery fetch error:", error);
        return [];
      }

      return (data || []).map((image) => ({
        ...image,
        gallery_type: image.gallery_types?.name,
        gallery_type_id: image.gallery_types?.id,
        tags: image.image_tags?.map((it) => it.tags).filter(Boolean) || [],
      }));
    } catch (error) {
      console.error("Gallery fetch error:", error);
      return [];
    }
  });
}

export async function getGalleryTypes(): Promise<string[]> {
  return retryWithBackoff(async () => {
    const supabase = await getSupabaseClient();
    if (!supabase) {
      console.error('Failed to initialize Supabase client');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from(TABLES.GALLERY_TYPE)
        .select("id,name")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching gallery types:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching gallery types:", error);
      return [];
    }
  });
}

export async function createGallery(name: string): Promise<void> {
  return retryWithBackoff(async () => {
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error("Supabase client not initialized");

    try {
      const { error } = await supabase.from(TABLES.GALLERY_TYPE).insert({ name });
      if (error) throw error;
    } catch (error) {
      console.error("Error creating gallery:", error);
      throw error;
    }
  });
}

export async function updateGallery(id: string, newName: string): Promise<void> {
  return retryWithBackoff(async () => {
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error("Supabase client not initialized");

    try {
      const { error } = await supabase
        .from(TABLES.GALLERY_TYPE)
        .update({ name: newName })
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating gallery:", error);
      throw error;
    }
  });
}

export async function deleteGallery(id: string): Promise<void> {
  return retryWithBackoff(async () => {
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error("Supabase client not initialized");

    try {
      // Update any images in this gallery to have no gallery type
      await supabase
        .from(TABLES.GALLERY)
        .update({ gallery_type_id: null })
        .eq("gallery_type_id", id);

      // Then delete the gallery type
      const { error } = await supabase
        .from(TABLES.GALLERY_TYPE)
        .delete()
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting gallery:", error);
      throw error;
    }
  });
}