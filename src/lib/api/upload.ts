import { getSupabaseClient } from "../supabase";
import { TABLES } from "../constants";
import type { GalleryImage } from "../../types";

export async function uploadImage(
  file: File,
  displayOrder: number,
  selectedGalleryType: string | null
): Promise<GalleryImage> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase client not initialized");

  try {
    // 1. Upload to storage
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(fileName, file);

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }

    // 2. Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(fileName);

    // 3. Create database record
    const { data, error: insertError } = await supabase
      .from(TABLES.GALLERY)
      .insert({
        title: file.name.replace(`.${fileExt}`, ""),
        description: "",
        url: publicUrl,
        width: 800,
        height: 600,
        display_order: displayOrder,
        gallery_type: selectedGalleryType, // Use the gallery type directly
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(`
        *,
        gallery_types (
          id,
          name
        )
      `)
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw insertError;
    }

    if (!data) {
      throw new Error("Failed to create image record");
    }

    return {
      ...data,
      gallery_type: data.gallery_types?.name,
      gallery_type_id: data.gallery_types?.id,
      tags: [],
    };
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}

export async function uploadMultipleImages(
  files: FileList,
  startOrder: number,
  selectedGalleryType: string | null = null
): Promise<GalleryImage[]> {
  try {
    const uploadPromises = Array.from(files).map((file, index) =>
      uploadImage(file, startOrder + index, selectedGalleryType)
    );

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading multiple images:", error);
    throw error;
  }
}