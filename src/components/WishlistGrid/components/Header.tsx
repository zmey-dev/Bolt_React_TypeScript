import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Upload, FileText, ArrowLeft, Wand2 } from 'lucide-react';

interface HeaderProps {
  itemCount: number;
  onUploadClick: () => void;
  onGenerateClick: () => void;
  onQuoteClick: () => void;
}

export function Header({ itemCount, onUploadClick, onGenerateClick, onQuoteClick }: HeaderProps) {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-2 text-purple-400 mb-2">
        <Heart className="w-6 h-6" />
        <h1 className="text-2xl font-bold text-white">My Wishlist</h1>
      </div>
      
      {/* Wrap the text in a container with max-width and center it */}
      <div className="max-w-2xl mx-auto px-4">
        <p className="text-gray-400 mb-2">
          Add notes for each lighting design in your wishlist, including sizes, colors, customizations, or special requests, to help us provide an accurate quote. You can also upload your own design or use the 'Generate New Design' button for AI-generated custom options. When you’re done, click 'Request a Quote' to receive an estimate.
        </p>
      </div>
      
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
          onClick={onGenerateClick}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Wand2 className="w-4 h-4" />
          Generate New Design
        </button>

        <button
          onClick={onQuoteClick}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <FileText className="w-4 h-4" />
          Request a Quote
        </button>
      </div>
    </div>
  );
}