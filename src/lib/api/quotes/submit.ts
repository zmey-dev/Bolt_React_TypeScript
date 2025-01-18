import { getSupabaseClient } from "../../supabase";
import { v4 as uuidv4 } from "uuid";
import type { QuoteRequest } from "../../../types";
import { sendQuoteNotification } from "../email";

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

export async function submitQuoteRequest(data: QuoteRequest): Promise<string> {
  const supabase = await getSupabaseClient();
  if (!supabase) throw new Error("Supabase client not initialized");

  return retryWithBackoff(async () => {
    try {
      // Begin transaction by inserting quote request
      const { data: quote, error: quoteError } = await supabase
        .from("quote_requests")
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone,
          timeline: data.timeline,
          budget: data.budget,
          notes: data.notes,
          status: "pending",
        })
        .select("id")
        .single();
      sendQuoteNotification(data);

      if (quoteError) {
        console.error("Failed to create quote request:", quoteError);
        throw new Error("Failed to submit quote request");
      }

      if (!quote) {
        throw new Error("Failed to create quote request");
      }

      // Insert image associations if any
      if (data.selectedImages && data.selectedImages.length > 0) {
        const imageAssociations = data.selectedImages.map((item) => ({
          quote_request_id: quote.id,
          image_id: item.image_id,
          notes: item.notes || "",
          url: item.isCustomUpload ? item.url : null,
        }));

        const { error: imagesError } = await supabase
          .from("quote_request_images")
          .insert(imageAssociations);

        if (imagesError) {
          console.error("Failed to associate images:", imagesError);
          throw new Error("Failed to submit quote request");
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
