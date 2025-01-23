import React from 'react';
import { AdminNav } from '../../components/AdminNav';
import { QuoteRequestsTable } from './QuoteRequests/components/QuoteRequestsTable';
import { useQuoteRequests } from './QuoteRequests/hooks/useQuoteRequests';

export function QuoteRequests() {
  const { 
    quotes,
    loading,
    error,
    selectedQuote,
    setSelectedQuote,
    handleStatusChange,
    handleDelete,
    handleCloseModal
  } = useQuoteRequests();

  return (
    <div className="min-h-screen bg-[url('https://jpvvgmvvdfsiruthfkhb.supabase.co/storage/v1/object/public/images/Website%20Design%20Images/LightShowVault%20Darker%20Background.svg?t=2025-01-21T15%3A48%3A42.034Z')] bg-cover bg-center bg-no-repeat">
      <AdminNav />
      <QuoteRequestsTable
        quotes={quotes}
        loading={loading}
        error={error}
        selectedQuote={selectedQuote}
        onSelectQuote={setSelectedQuote}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        onCloseModal={handleCloseModal}
      />
    </div>
  );
}