import React from 'react';
import { Upload, Trash2 } from 'lucide-react';
import type { WishlistItem } from '../../../types';

interface WishlistItemCardProps {
  item: WishlistItem;
  onRemove: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
}

export function WishlistItemCard({ item, onRemove, onUpdateNotes }: WishlistItemCardProps) {
  const [notes, setNotes] = React.useState(item.notes || '');

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setNotes(newValue);
    onUpdateNotes(item.id, newValue);
  };

  const handleRemove = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(item.id);
  }, [item.id, onRemove]);

  return (
    <div className="relative bg-[#260000] rounded-lg overflow-hidden group h-[420px] flex flex-col border-2 border-[#fbbf24] shadow-[0_0_10px_rgba(251,191,36,0.1)] hover:shadow-[0_0_20px_rgba(251,191,36,0.15)] hover:border-[#f59e0b] transition-all">
      <div className="relative w-full flex items-center justify-center bg-[#260000] overflow-hidden" style={{ maxHeight: '280px' }}>
        <img
          src={item.url}
          alt={item.title || ''}
          className="w-full h-full object-contain"
        />
        {/* Delete icon without a background circle */}
        <button
          onClick={handleRemove}
          className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-300 transition-colors"
          aria-label="Remove item"
        >
          <Trash2 className="w-5 h-5" />
        </button>
        {item.isCustomUpload && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-[#260000] px-2 py-1 rounded-lg text-sm flex items-center gap-1 font-medium shadow-lg">
            <Upload className="w-3 h-3" />
            Custom Upload
          </div>
        )}
      </div>
      
      <div className="p-3 flex-1 flex flex-col">
       <textarea
  value={notes}
  onChange={handleNotesChange}
  placeholder="Add notes..."
  className="w-full bg-[#1f1f1f] text-white rounded-lg p-2 mb-2 resize-none flex-1 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 border border-yellow-400/20 placeholder-gray-400"
  rows={3}
/>
      </div>
    </div>
  );
}