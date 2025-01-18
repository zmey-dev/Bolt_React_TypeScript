import React from 'react';
import { Trash2 } from 'lucide-react';

interface RemoveButtonProps {
  onRemove: () => void;
}

export function RemoveButton({ onRemove }: RemoveButtonProps) {
  return (
    <button
      onClick={onRemove}
      type="button"
      className="flex items-center gap-2 text-red-500 hover:text-red-400 px-1 mt-auto transition-colors"
    >
      <Trash2 className="w-4 h-4" />
      <span className="text-sm">Remove</span>
    </button>
  );
}