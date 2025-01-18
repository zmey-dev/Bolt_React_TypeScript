import React from 'react';
import { AdminNav } from '../../../components/AdminNav';
import { QuoteRequestsTable } from './components/QuoteRequestsTable';
import { useQuoteRequests } from './hooks/useQuoteRequests';

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
    <div className="min-h-screen bg-black">
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