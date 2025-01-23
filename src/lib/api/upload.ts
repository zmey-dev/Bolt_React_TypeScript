import { getSupabaseClient } from "../supabase";
import { TABLES } from "../constants";
import type { GalleryImage } from "../types";

export async function uploadImage(
  file: File,
  gallery_type_id: string,
  tagIds: string[] = []
): Promise<GalleryImage> {
  console.log('Starting image upload:', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    gallery_type_id,
    tagIds
  });

  const supabase = getSupabaseClient();
  if (!supabase) {
    console.error('Supabase client not initialized');
    throw new Error("Supabase client not initialized");
  }

  try {
    // 1. Upload to storage
    const fileExt = file.name.split(".").pop()?.toLowerCase() || 'jpg';
    const timestamp = new Date().getTime();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}-${randomId}.${fileExt}`;
    console.log('Generated file name:', fileName);

    console.log('Attempting storage upload...');
    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Storage upload error:", {
        code: uploadError.code,
        message: uploadError.message,
        details: uploadError.details,
        hint: uploadError.hint
      });
      throw uploadError;
    }

    console.log('Storage upload successful');
    // 2. Get public URL
    console.log('Getting public URL...');
    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(fileName);
    console.log('Public URL:', publicUrl);

    // 3. Get next display order with proper locking
    console.log('Getting next display order...');
    const { data: nextOrder, error: seqError } = await supabase
      .rpc('get_next_display_order');

    if (seqError) {
      console.error("Error getting next display order:", seqError);
      throw seqError;
    }

    console.log('Next display order:', nextOrder);

    // 3. Create database record
    console.log('Creating database record...');
    const { data, error: insertError } = await supabase
      .from(TABLES.GALLERY)
      .insert({
        title: file.name.replace(`.${fileExt}`, ""),
        description: "",
        url: publicUrl,
        width: 800,
        height: 600,
        gallery_type_id: gallery_type_id,
        display_order: nextOrder.next_order,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(
        `
        *,
        gallery_types (
          id,
          name
        )
      `
      )
      .single();

    if (insertError) {
      console.error("Database insert error:", {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
      throw insertError;
    }

    // Add tags if any are selected
    if (tagIds.length > 0) {
      const { error: tagError } = await supabase
        .from(TABLES.IMAGE_TAGS)
        .insert(
          tagIds.map(tagId => ({
            image_id: data.id,
            tag_id: tagId
          }))
        );

      if (tagError) {
        console.warn('Failed to assign tags:', tagError);
      }
    }

    if (!data) {
      console.error("No data returned from insert");
      throw new Error("Failed to create image record");
    }

    console.log('Upload completed successfully:', {
      id: data.id,
      url: data.url,
      gallery_type: data.gallery_types?.name
    });
    return {
      ...data,
      gallery_type: data.gallery_types?.name,
      gallery_type_id: data.gallery_types?.id,
      tags: [],
    };
  } catch (error) {
    console.error("Upload error:", {
      name: error.name,
      message: error.message,
      code: error.code,
      details: error.details,
      stack: error.stack
    });
    throw error;
  }
}

export async function uploadMultipleImages(
  files: FileList,
  gallery_type_id: string,
  tagIds: string[] = []
): Promise<GalleryImage[]> {
  console.log('Starting multiple image upload:', {
    fileCount: files.length,
    gallery_type_id,
    tagIds
  });

  try {
    const uploadPromises = Array.from(files).map((file, index) =>
      uploadImage(file, gallery_type_id, tagIds)
    );

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading multiple images:", {
      name: error.name,
      message: error.message,
      code: error.code,
      details: error.details,
      stack: error.stack
    });
    throw error;
  }
}
