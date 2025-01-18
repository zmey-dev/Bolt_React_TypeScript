import { getSupabaseClient } from '../../supabase';
import { TABLES } from '../../constants';
import type { GalleryImage } from '../../../types';

export async function updateGalleryOrder(images: GalleryImage[]) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn('Supabase client not initialized');
    return;
  }

  try {
    const updates = images.map((image, index) => ({
      id: image.id,
      display_order: index + 1
    }));

    const { error } = await supabase
      .from(TABLES.GALLERY)
      .upsert(updates, { 
        onConflict: 'id',
        ignoreDuplicates: false
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error updating gallery order:', error);
    throw error;
  }
}