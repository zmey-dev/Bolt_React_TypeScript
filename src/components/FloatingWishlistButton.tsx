import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

interface FloatingWishlistButtonProps {
  count: number;
}

export function FloatingWishlistButton({ count }: FloatingWishlistButtonProps) {
  const navigate = useNavigate();

  if (count === 0) return null;

  return (
    <button
      onClick={() => navigate('/wishlist')}
      className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg flex items-center gap-2 transition-all hover:scale-105 z-50"
    >
      <Heart className="w-5 h-5" />
      <span className="font-medium">{count}</span>
    </button>
  );
}