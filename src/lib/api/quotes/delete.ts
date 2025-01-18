import { getSupabaseClient } from '../../supabase';
import { handleQuoteError } from './error';

export async function deleteQuoteRequest(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  try {
    const { error } = await supabase
      .from('quote_requests')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    throw handleQuoteError('Failed to delete quote request');
  }
}