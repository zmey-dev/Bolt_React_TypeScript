import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { GripVertical, Upload, Trash2 } from 'lucide-react';
import { SortableItem } from './SortableItem';
import type { WishlistItem } from '../../../types';

interface WishlistItemCardProps {
  item: WishlistItem;
  onRemove: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
}

export function WishlistItemCard({ item, onRemove, onUpdateNotes }: WishlistItemCardProps) {
  const [notes, setNotes] = React.useState(item.notes || '');
  const { attributes, listeners, setNodeRef } = useSortable({ id: item.id });

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
    <div ref={setNodeRef} className="relative bg-gray-900 rounded-lg overflow-hidden group h-[420px] flex flex-col">
      <div className="relative h-[280px]">
        <img
          src={item.url}
          alt={item.title || ''}
          className="w-full h-full object-cover"
        />
        <div {...attributes} {...listeners} className="absolute top-2 right-2">
          <GripVertical className="w-6 h-6 text-white opacity-75 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing" />
        </div>
        {item.isCustomUpload && (
          <div className="absolute top-2 left-2 bg-purple-600/80 text-white px-2 py-1 rounded-lg text-sm flex items-center gap-1">
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
          className="w-full bg-gray-800 text-white rounded-lg p-2 mb-2 resize-none flex-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows={3}
        />
        <button
          onClick={handleRemove}
          type="button"
          className="flex items-center gap-2 text-red-500 hover:text-red-400 px-1 mt-auto transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-sm">Remove</span>
        </button>
      </div>
    </div>
  );
}