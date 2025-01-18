import { useState, useEffect, useCallback } from 'react';
import { getQuoteRequests, updateQuoteStatus, deleteQuoteRequest } from '../../../../lib/api/quotes';
import type { QuoteRequestWithImages } from '../../../../types';

export function useQuoteRequests() {
  const [quotes, setQuotes] = useState<QuoteRequestWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequestWithImages | null>(null);

  const loadQuotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getQuoteRequests();
      setQuotes(data);
    } catch (err) {
      setError('Failed to load quote requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuotes();
  }, [loadQuotes]);

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      await deleteQuoteRequest(id);
      // Remove the quote from state immediately
      setQuotes(prevQuotes => prevQuotes.filter(quote => quote.id !== id));
      if (selectedQuote?.id === id) {
        setSelectedQuote(null);
      }
    } catch (err) {
      setError('Failed to delete quote request');
      console.error('Error deleting quote request:', err);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateQuoteStatus(id, status);
      setQuotes(prevQuotes => 
        prevQuotes.map(quote => 
          quote.id === id ? { ...quote, status } : quote
        )
      );
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update quote status');
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
    handleCloseModal
  };
}