import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Upload, FileText, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  itemCount: number;
  onUploadClick: () => void;
  onQuoteClick: () => void;
}

export function Header({ itemCount, onUploadClick, onQuoteClick }: HeaderProps) {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-2 text-purple-400 mb-2">
        <Heart className="w-6 h-6" />
        <h1 className="text-2xl font-bold text-white">My Wishlist</h1>
      </div>
      
      <p className="text-gray-400 mb-2">
        Organize and customize your selected lighting designs
      </p>
      
      <p className="text-purple-400 mb-8">
        {itemCount} {itemCount === 1 ? 'item' : 'items'} in wishlist
      </p>

      <div className="flex items-center justify-center gap-4">
        <Link 
          to="/"
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Gallery
        </Link>

        <button
          onClick={onUploadClick}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload Your Own Design
        </button>

        <button
          onClick={onQuoteClick}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <FileText className="w-4 h-4" />
          Request Quote
        </button>
      </div>
    </div>
  );
}