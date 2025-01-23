// Re-export everything from the quotes module
import { getSupabaseClient } from "../supabase";
export * from "./quotes/index";

const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 1000;
const MAX_BACKOFF = 10000;

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = INITIAL_BACKOFF
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries === 0) throw error;
    const nextDelay = Math.min(delay * 2, MAX_BACKOFF);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryWithBackoff(operation, retries - 1, nextDelay);
  }
}

export async function submitQuoteRequest(data: QuoteRequest): Promise<string> {
  const supabase = await getSupabaseClient();
  if (!supabase) throw new Error("Supabase client not initialized");

  // Get access code details if provided
  let affiliateId = null;
  if (window.access_code) {
    affiliateId = window.access_code.created_by_id;
  }

  return retryWithBackoff(async () => {
    try {
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
        throw new Error("Failed to submit quote request");
      }

      if (!quote) {
        throw new Error("Failed to create quote request");
      }

      // Insert image associations if any
      if (data.selectedImages && data.selectedImages.length > 0) {
        // Insert all image associations at once
        const { error: imagesError } = await supabase
          .from("quote_request_images")
          .insert(
            data.selectedImages.map((item) => ({
              quote_request_id: quote.id,
              image_id: item.image_id,
              notes: item.notes || "",
              url: item.isCustomUpload ? item.url : null,
            }))
          );

        if (imagesError) {
          console.warn("Failed to associate images:", imagesError);
          // Continue anyway - don't fail the quote submission
        }
      }

      return quote.id;
    } catch (error) {
      console.error("Error submitting quote request:", error);
      throw error instanceof Error
        ? error
        : new Error("Failed to submit quote request");
    }
  });
}
