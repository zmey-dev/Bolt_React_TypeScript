import React from 'react';
import { Heart } from 'lucide-react';

interface WishlistButtonProps {
  onClick: (e: React.MouseEvent) => void;
}

export function WishlistButton({ onClick }: WishlistButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg"
    >
      <Heart className="w-4 h-4" />
      <span className="sr-only">Add to Wishlist</span>
    </button>
  );
}