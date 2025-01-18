import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Image, Heart } from 'lucide-react';

interface HeaderProps {
  wishlistCount: number;
  galleryTypes: Array<{ id: string; name: string }>;
  selectedGalleryType: { id: string; name: string } | null;
  onSelectGalleryType: (type: { id: string; name: string } | null) => void;
}

export function Header({ 
  wishlistCount, 
  galleryTypes,
  selectedGalleryType,
  onSelectGalleryType 
}: HeaderProps) {
  const location = useLocation();
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm px-6 py-4">
      <div className="max-w-[1400px] mx-auto flex items-center">
        <Link to="/" className="text-xl font-bold text-white hover:text-purple-400 transition-colors">
          LightShowVault
        </Link>
        
        {/* Center the navigation items */}
        <div className="flex-1 flex items-center justify-center gap-12">
          {/* Gallery Type Tabs */}
          <div className="flex items-center gap-4">
            {galleryTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => onSelectGalleryType(type)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  selectedGalleryType?.id === type.id
                    ? "bg-purple-600 text-white"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                {type.name}
              </button>
            ))}
          </div>
          
          <Link 
            to="/wishlist" 
            className={`flex items-center gap-2 hover:text-purple-400 transition-colors ${
              location.pathname === '/wishlist' ? 'text-purple-400' : 'text-white'
            }`}
          >
            <Heart className="w-4 h-4" />
            View Wishlist ({wishlistCount})
          </Link>
        </div>
      </div>
    </nav>
  );
}