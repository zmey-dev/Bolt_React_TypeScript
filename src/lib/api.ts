import { getSupabaseClient } from './supabase';
import { TABLES } from './constants';
import type { Image } from '../types';

export async function loadGalleryImages(): Promise<Image[]> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    console.warn('Supabase not connected');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.GALLERY)
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Gallery fetch error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Gallery fetch error:', error);
    return [];
  }
}