import React from 'react';
import { Heart, Upload } from 'lucide-react';

interface EmptyStateProps {
  onUpload: () => void;
}

export function EmptyState({ onUpload }: EmptyStateProps) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 text-purple-400 mb-4">
        <Heart className="w-6 h-6" />
        <h1 className="text-2xl font-bold text-white">My Wishlist</h1>
      </div>
      <p className="text-gray-400 mb-8">Add items from the gallery or upload your own designs</p>
      <button
        onClick={onUpload}
        className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
      >
        <Upload className="w-5 h-5" />
        Upload your own design
      </button>
    </div>
  );
}