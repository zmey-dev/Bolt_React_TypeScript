import React from 'react';
import { Loader2, AlertCircle, Clock, CheckCircle, XCircle, MoreHorizontal, Trash2, Phone } from 'lucide-react';
import { QuoteRequestModal } from './QuoteRequestModal';
import { StatusBadge } from './StatusBadge';
import { formatTimeline, formatBudget } from '../../../../lib/utils/formatters';
import type { QuoteRequestWithImages } from '../../../../types';

interface QuoteRequestsTableProps {
  quotes: QuoteRequestWithImages[];
  loading: boolean;
  error: string | null;
  selectedQuote: QuoteRequestWithImages | null;
  onSelectQuote: (quote: QuoteRequestWithImages | null) => void;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onCloseModal: () => void;
}

export function QuoteRequestsTable({
  quotes,
  loading,
  error,
  selectedQuote,
  onSelectQuote,
  onStatusChange,
  onDelete,
  onCloseModal
}: QuoteRequestsTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">Quote Requests</h1>

      {error && (
        <div className="mb-8 p-4 bg-red-900/30 border border-red-500 rounded-lg flex items-center gap-3 text-red-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {quotes.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">No quote requests yet</p>
          <p className="text-sm">New requests will appear here</p>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Timeline</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Budget</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map(quote => (
                  <tr 
                    key={quote.id}
                    className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm">
                      {new Date(quote.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{quote.name}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-300">{quote.email}</p>
                        {quote.phone && (
                          <p className="text-sm text-gray-400 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {quote.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{formatTimeline(quote.timeline)}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{formatBudget(quote.budget)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={quote.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectQuote(quote)}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this quote request?')) {
                              onDelete(quote.id);
                            }
                          }}
                          className="p-2 hover:bg-red-900/30 text-red-400 hover:text-red-300 rounded-lg transition-colors"
                          title="Delete request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedQuote && (
        <QuoteRequestModal
          quote={selectedQuote}
          onClose={onCloseModal}
          onStatusChange={onStatusChange}
        />
      )}
    </div>
  );
}