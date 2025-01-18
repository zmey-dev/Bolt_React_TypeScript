import { getSupabaseClient } from '../../supabase';
import { handleQuoteError } from './error';

export async function updateQuoteStatus(id: string, status: string): Promise<void> {
  const supabase = await getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  try {
    const { error } = await supabase
      .from('quote_requests')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    throw handleQuoteError('Failed to update quote status');
  }
}