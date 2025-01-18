import { getSupabaseClient } from '../../supabase';
import { handleQuoteError } from './error';
import type { QuoteRequestWithImages } from '../../../types';

export async function getQuoteRequests(): Promise<QuoteRequestWithImages[]> {
  const supabase = await getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  try {
    const { data: quotes, error: quotesError } = await supabase
      .from('quote_requests')
      .select(`
        *,
        quote_request_images (
          image_id,
          notes,
          url,
          gallery_images (
            id,
            title,
            url,
            description,
            width,
            height,
            custom_upload
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (quotesError) throw quotesError;
    if (!quotes) return [];

    return quotes.map(quote => ({
      ...quote,
      images: (quote.quote_request_images || []).map(qri => ({
        id: qri.image_id,
        notes: qri.notes || '',
        url: qri.gallery_images?.url || qri.url || '',
        title: qri.gallery_images?.title || 'Custom Upload',
        description: qri.gallery_images?.description || '',
        width: qri.gallery_images?.width || 800,
        height: qri.gallery_images?.height || 600,
        isCustomUpload: !qri.gallery_images || qri.gallery_images.custom_upload
      })).filter(img => img.url)
    }));
  } catch (error) {
    console.error('Error fetching quote requests:', error);
    throw handleQuoteError('Failed to fetch quote requests');
  }
}