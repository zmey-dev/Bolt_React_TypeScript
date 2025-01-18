import { getSupabaseClient } from "../supabase";
import { TABLES } from "../constants";
import type { GalleryImage } from "../../types";

export async function loadGalleryImages(): Promise<GalleryImage[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn("Supabase client not initialized");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.GALLERY)
      .select(
        `
        *,
        gallery_types (
          id,
          name
        ),
        image_tags (
          tags (
            name
          )
        )
      `
      )
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
      tags: image.image_tags?.map((it) => it.tags.name) || [],
    }));
  } catch (error) {
    console.error("Gallery fetch error:", error);
    return [];
  }
}

export async function updateGalleryOrder(images: GalleryImage[]) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    const updates = images.map((image, index) => ({
      id: image.id,
      display_order: index + 1,
    }));

    const { error } = await supabase
      .from(TABLES.GALLERY)
      .upsert(updates, { onConflict: "id" });

    if (error) throw error;
  } catch (error) {
    console.error("Error updating gallery order:", error);
    throw error;
  }
}

export async function getGalleryTypes(): Promise<string[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from(TABLES.GALLERY_TYPE)
      .select("id,name")
      .order("name");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching gallery types:", error);
    return [];
  }
}

export async function createGallery(name: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase client not initialized");

  try {
    const { error } = await supabase.from(TABLES.GALLERY_TYPE).insert({ name });
    if (error) throw error;
  } catch (error) {
    console.error("Error creating gallery:", error);
    throw error;
  }
}

export async function updateGallery(
  id: string,
  newName: string
): Promise<void> {
  const supabase = getSupabaseClient();
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
}

export async function deleteGallery(id: string): Promise<void> {
  const supabase = getSupabaseClient();
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
}
