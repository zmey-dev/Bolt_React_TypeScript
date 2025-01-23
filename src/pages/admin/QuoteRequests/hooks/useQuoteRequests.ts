import { useState, useEffect, useCallback } from "react";
import { getSupabaseClient } from "../../../../lib/supabase";
import {
  deleteQuoteRequest,
  updateQuoteStatus,
} from "../../../../lib/api/quotes";
import { useAuth } from "../../../../hooks/useAuth";
import type { QuoteRequestWithImages } from "../../../../types";

export function useQuoteRequests() {
  const [quotes, setQuotes] = useState<QuoteRequestWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] =
    useState<QuoteRequestWithImages | null>(null);
  const { user, isSuperAdmin } = useAuth();

  const loadQuotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase client not initialized");

      // Start with base query
      const query = supabase.from("quote_requests").select(`
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
        `);

      // If not super admin, only show quotes from affiliate's access codes
      if (!isSuperAdmin && user?.id) {
        query.eq("affiliate_id", user.id);
      }

      // Add ordering
      query.order("created_at", { ascending: false });

      const { data, error: quotesError } = await query;
      console.log(data);

      if (quotesError) throw quotesError;
      setQuotes(data || []);
    } catch (err) {
      setError("Failed to load quote requests");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, isSuperAdmin]);

  useEffect(() => {
    loadQuotes();
  }, [loadQuotes]);

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      await deleteQuoteRequest(id);
      // Remove the quote from state immediately
      setQuotes((prevQuotes) => prevQuotes.filter((quote) => quote.id !== id));
      if (selectedQuote?.id === id) {
        setSelectedQuote(null);
      }
    } catch (err) {
      setError("Failed to delete quote request");
      console.error("Error deleting quote request:", err);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateQuoteStatus(id, status);
      setQuotes((prevQuotes) =>
        prevQuotes.map((quote) =>
          quote.id === id ? { ...quote, status } : quote
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update quote status");
    }
  };

  const handleCloseModal = () => {
    setSelectedQuote(null);
  };

  return {
    quotes,
    loading,
    error,
    selectedQuote,
    setSelectedQuote,
    handleStatusChange,
    handleDelete,
    handleCloseModal,
  };
}
