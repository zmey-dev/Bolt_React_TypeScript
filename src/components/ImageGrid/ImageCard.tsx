import React from 'react';
import { Image } from '../../types';
import { Heart, Check } from 'lucide-react';

interface ImageCardProps {
  image: Image;
  isInWishlist: boolean;
  onAddToWishlist: (image: Image) => void;
  onRemoveFromWishlist: (id: string) => void;
}

export function ImageCard({ 
  image, 
  isInWishlist, 
  onAddToWishlist, 
  onRemoveFromWishlist 
}: ImageCardProps) {
  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist) {
      onRemoveFromWishlist(image.id);
    } else {
      onAddToWishlist(image);
    }
  };

  return (
    <div className="mb-4 relative group overflow-hidden rounded-lg w-full">
      <img
        src={image.url}
        alt=""
        title=""
        className="w-full h-auto rounded-lg transform transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={handleWishlistClick}
            className={`flex items-center gap-2 ${
              isInWishlist 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-purple-600 hover:bg-purple-700'
            } text-white px-4 py-2 rounded-lg transition-colors`}
          >
            {isInWishlist ? (
              <>
                <Check className="w-4 h-4" />
                Added to Wishlist
              </>
            ) : (
              <>
                <Heart className="w-4 h-4" />
                Add to Wishlist
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}