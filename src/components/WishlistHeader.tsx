import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

interface WishlistHeaderProps {
  count: number;
}

export function WishlistHeader({ count }: WishlistHeaderProps) {
  const navigate = useNavigate();

  if (count === 0) return null;

  return (
    <div className="sticky top-0 z-40 py-2 bg-black">
      <div className="max-w-7xl mx-auto px-4">
        <button
          onClick={() => navigate('/wishlist')}
          className="w-full bg-purple-600/95 hover:bg-purple-600 backdrop-blur-sm text-white py-3 px-6 rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group"
        >
          <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">View Wishlist ({count} items)</span>
        </button>
      </div>
    </div>
  );
}