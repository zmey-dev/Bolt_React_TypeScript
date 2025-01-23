import { getSupabaseClient } from "../../supabase";
import type { QuoteRequest } from "../../../types";

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 5000;

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = INITIAL_RETRY_DELAY
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries === 0) throw error;
    const nextDelay = Math.min(delay * 2, MAX_RETRY_DELAY);
    await new Promise(resolve => setTimeout(resolve, nextDelay));
    return retryWithBackoff(operation, retries - 1, nextDelay);
  }
}

export async function submitQuoteRequest(data: QuoteRequest): Promise<string> {
  console.log('submitQuoteRequest: Starting submission process', { 
    hasName: !!data.name,
    hasEmail: !!data.email,
    hasPhone: !!data.phone,
    imagesCount: data.selectedImages?.length
  });
  // Validate input data
  if (!data.name || !data.email || !data.phone || !data.timeline || !data.budget) {
    console.error('submitQuoteRequest: Missing required fields');
    throw new Error('Please fill in all required fields');
  }

  if (!data.selectedImages || data.selectedImages.length === 0) {
    console.error('submitQuoteRequest: No images selected');
    throw new Error('Please select at least one design for your quote request');
  }

  // Get access code details if provided
  let affiliateId = null;
  if (window.access_code) {
    console.log('submitQuoteRequest: Using access code', { 
      hasCreatedById: !!window.access_code.created_by_id 
    });
    affiliateId = window.access_code.created_by_id;
  }

  return retryWithBackoff(async () => {
    try {
      console.log('submitQuoteRequest: Getting Supabase client');
      // Get Supabase client inside retry block
      const supabase = await getSupabaseClient();
      if (!supabase) {
        console.error('submitQuoteRequest: Failed to get Supabase client');
        throw new Error("Connection error. Please check your internet connection and try again.");
      }

      console.log('submitQuoteRequest: Creating quote request');
      // Begin transaction
      const { data: quote, error: quoteError } = await supabase
        .from("quote_requests")
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone,
          timeline: data.timeline,
          budget: data.budget,
          notes: data.notes,
          affiliate_id: affiliateId,
          access_code_id: window.access_code?.id,
          status: "pending",
        })
        .select("id")
        .single();

      if (quoteError) {
        console.error("Failed to create quote request:", quoteError);
        console.error("Quote error details:", {
          message: quoteError.message,
          details: quoteError.details,
          hint: quoteError.hint
        });
        throw new Error(quoteError.message || "Failed to submit quote request. Please try again.");
      }

      if (!quote) {
        console.error('submitQuoteRequest: No quote data returned');
        throw new Error("Failed to create quote request. Please try again.");
      }

      console.log('submitQuoteRequest: Quote created successfully', { quoteId: quote.id });

      // Insert image associations if any
      if (data.selectedImages && data.selectedImages.length > 0) {
        console.log('submitQuoteRequest: Associating images', { 
          imageCount: data.selectedImages.length 
        });
        const { error: imagesError } = await supabase
          .from("quote_request_images")
          .insert(
            data.selectedImages.map(item => ({
              quote_request_id: quote.id,
              image_id: item.image_id,
              notes: item.notes || "",
              url: item.isCustomUpload ? item.url : null
            }))
          );

        if (imagesError) {
          console.warn('Failed to associate images:', imagesError);
          console.warn('Image error details:', {
            message: imagesError.message,
            details: imagesError.details,
            hint: imagesError.hint
          });
          // Continue anyway - don't fail the quote submission
        }
      }

      console.log('submitQuoteRequest: Request completed successfully');
      return quote.id;
    } catch (err) {
      console.error("Quote submission error:", err);
      console.error("Error details:", {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
      throw err instanceof Error 
        ? err 
        : new Error("An unexpected error occurred. Please try again.");
    }
  });
}