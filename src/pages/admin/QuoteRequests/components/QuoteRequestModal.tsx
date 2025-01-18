import React from 'react';
import { X, Phone, Upload } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { formatTimeline, formatBudget } from '../../../../lib/utils/formatters';
import type { QuoteRequestWithImages } from '../../../../types';

interface QuoteRequestModalProps {
  quote: QuoteRequestWithImages;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
}

export function QuoteRequestModal({ quote, onClose, onStatusChange }: QuoteRequestModalProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative w-full max-w-4xl bg-gray-900 rounded-lg shadow-xl border border-gray-800">
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <div>
              <h2 className="text-xl font-semibold text-white">Quote Request Details</h2>
              <p className="text-sm text-gray-400 mt-1">
                Submitted on {new Date(quote.created_at).toLocaleDateString()}
              </p>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 space-y-8">
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Name</p>
                    <p className="text-white">{quote.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white">{quote.email}</p>
                  </div>
                  {quote.phone && (
                    <div>
                      <p className="text-sm text-gray-400">Phone</p>
                      <p className="text-white flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {quote.phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Project Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Timeline</p>
                    <p className="text-white">{formatTimeline(quote.timeline)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Budget</p>
                    <p className="text-white">{formatBudget(quote.budget)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            {quote.notes && (
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Additional Notes</h3>
                <p className="text-white bg-gray-800 rounded-lg p-4">{quote.notes}</p>
              </div>
            )}

            {/* Selected Images */}
            {quote.images && quote.images.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Selected Designs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quote.images.map(image => (
                    <div key={image.id} className="bg-gray-800 rounded-lg overflow-hidden">
                      <div className="relative aspect-video">
                        <img
                          src={image.url}
                          alt={image.title || ''}
                          className="w-full h-full object-cover"
                        />
                        {image.isCustomUpload && (
                          <div className="absolute top-2 left-2 bg-purple-600/80 text-white px-2 py-1 rounded-lg text-sm flex items-center gap-1">
                            <Upload className="w-3 h-3" />
                            Custom Upload
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-400 mb-2">Design Notes</p>
                        <p className="text-white bg-gray-900 rounded-lg p-3 text-sm">
                          {image.notes || 'No notes provided'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between p-6 border-t border-gray-800 bg-gray-900/50">
            <div className="flex items-center gap-4">
              <StatusBadge status={quote.status} />
              <select
                value={quote.status}
                onChange={(e) => onStatusChange(quote.id, e.target.value)}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-1.5"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}