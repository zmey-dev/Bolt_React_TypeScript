import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, GripVertical } from 'lucide-react';
import { WishlistItem } from '../../types';

interface WishlistItemCardProps {
  item: WishlistItem;
  onRemove: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
}

export function WishlistItemCard({ item, onRemove, onUpdateNotes }: WishlistItemCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-900 rounded-lg overflow-hidden group h-[420px] flex flex-col"
    >
      <div className="relative h-[280px]">
        <img
          src={item.url}
          alt={item.title}
          className="w-full h-full object-cover"
        />
        <div {...attributes} {...listeners} className="absolute top-2 right-2 cursor-grab active:cursor-grabbing">
          <GripVertical className="w-6 h-6 text-white opacity-75 hover:opacity-100 transition-opacity" />
        </div>
      </div>
      
      <div className="p-3 flex-1 flex flex-col">
        <textarea
          value={item.notes}
          onChange={(e) => onUpdateNotes(item.id, e.target.value)}
          placeholder="Add notes..."
          className="w-full bg-gray-800 text-white rounded-lg p-2 mb-2 resize-none flex-1"
          rows={3}
        />
        <div 
          onClick={() => onRemove(item.id)}
          className="flex items-center gap-2 text-red-500 hover:text-red-400 cursor-pointer px-1 mt-auto"
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-sm">Remove</span>
        </div>
      </div>
    </div>
  );
}