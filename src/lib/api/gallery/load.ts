import { getSupabaseClient } from '../../supabase/client';
import { TABLES } from '../../constants';
import type { Image } from '../../../types';

export async function loadGalleryImages(): Promise<Image[]> {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) {
      console.warn('Supabase client not initialized');
      return [];
    }

    // Add timeout to fetch request
    const { data, error } = await Promise.race([
      supabase
        .from(TABLES.GALLERY)
        .select(`
          *,
          image_tags!inner (
            tags!inner (
              name
            )
          )
        `)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      )
    ]) as any;

    if (error) {
      throw error;
    }

    return (data || []).map(image => ({
      ...image,
      tags: image.image_tags?.map(it => it.tags.name) || []
    }));
  } catch (error) {
    console.error('Gallery fetch error:', error);
    // Return empty array instead of throwing to prevent UI crashes
    return [];
  }
}