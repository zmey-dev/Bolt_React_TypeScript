import { getSupabaseClient } from "../../supabase";
import { v4 as uuidv4 } from "uuid";
import type { WishlistItem } from "../../../types";
import { TABLES } from "../../constants";

export async function uploadWishlistImage(file: File): Promise<WishlistItem> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase client not initialized");

  try {
    // Generate unique filename using UUID and original extension
    const imageId = uuidv4();
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${imageId}.${fileExt}`;

    // Upload to wishlist-uploads bucket
    const { error: uploadError } = await supabase.storage
      .from("wishlist-uploads")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("wishlist-uploads").getPublicUrl(fileName);

    // const { data: maxDisplayOrder, error } = await supabase
    //   .from(TABLES.)
    //   .select("display_order")
    //   .order("display_order", { ascending: false })
    //   // .single();
    //   .limit(1);

    // 3. Create database record
    // const { data, error: insertError } = await supabase
    //   .from(TABLES.GALLERY)
    //   .insert({
    //     title: file.name.replace(`.${fileExt}`, ""),
    //     description: "",
    //     url: publicUrl,
    //     width: 800, // Default width
    //     height: 600, // Default height
    //     display_order:
    //       Number(
    //         maxDisplayOrder?.length > 0 && maxDisplayOrder[0]?.display_order
    //       ) + 1,
    //     created_at: new Date().toISOString(),
    //     updated_at: new Date().toISOString(),
    //   })
    //   .select("*")
    //   .single();

    // if (insertError) throw insertError;
    // if (!data) throw new Error("Failed to create image record");

    // Return wishlist item format
    return {
      // id: data.id,
      url: publicUrl,
      title: file.name.replace(`.${fileExt}`, ""),
      description: "",
      width: 800, // Default dimensions
      height: 600,
      isCustomUpload: true,
    };
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}
