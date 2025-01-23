import { getSupabaseClient } from '../../supabase';
import { handleQuoteError } from './error';
import type { QuoteRequestWithImages } from '../../../types';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = INITIAL_RETRY_DELAY
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryWithBackoff(operation, retries - 1, delay * 2);
  }
}

export async function getQuoteRequests(): Promise<QuoteRequestWithImages[]> {
  return retryWithBackoff(async () => {
    const supabase = await getSupabaseClient();
    if (!supabase) {
      console.error('Failed to initialize Supabase client');
      return [];
    }

    try {
      const { data: quotes, error: quotesError } = await supabase
        .from('quote_requests')
        .select(`
          *,
          quote_request_images!left (
            image_id,
            notes,
            url,
            gallery_images!left (
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

      if (quotesError) {
        console.error('Error fetching quotes:', quotesError);
        return [];
      }
      
      if (!quotes) return [];

      // Map the data and handle potential null values
      return quotes.map(quote => ({
        ...quote,
        images: (quote.quote_request_images || [])
          .filter(qri => qri && (qri.gallery_images?.url || qri.url)) // Filter out invalid entries
          .map(qri => ({
            id: qri.image_id,
            notes: qri.notes || '',
            url: qri.gallery_images?.url || qri.url || '',
            title: qri.gallery_images?.title || 'Custom Upload',
            description: qri.gallery_images?.description || '',
            width: qri.gallery_images?.width || 800,
            height: qri.gallery_images?.height || 600,
            isCustomUpload: !qri.gallery_images || qri.gallery_images.custom_upload
          }))
      }));
    } catch (error) {
      console.error('Error fetching quote requests:', error);
      return []; // Return empty array instead of throwing
    }
  });
}