import React, { useState, useEffect } from 'react';
import { Loader2, X, ArrowRight, Heart, AlertCircle, Clock, Check, Wand2, Download } from 'lucide-react';
import { generateSimilarImage } from '../lib/api/ai';
import { storeGeneratedImage } from '../lib/api/storage';

interface GenerateImageModalProps {
  isOpen: boolean;
  onClose: (e?: React.MouseEvent) => void;
  sourceImageUrl: string;
  onAddToWishlist?: (imageUrl: string, action: 'add' | 'remove') => void;
}

export function GenerateImageModal({ 
  isOpen, 
  onClose, 
  sourceImageUrl,
  onAddToWishlist 
}: GenerateImageModalProps) {
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [storedImageUrl, setStoredImageUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      setGeneratedImageUrl(null);
      setStoredImageUrl(null);
      setShowInfo(false);
      
      // First generate the image
      const newImageUrl = await generateSimilarImage(sourceImageUrl);
      
      try {
        // Then try to store it
        const storedUrl = await storeGeneratedImage(newImageUrl);
        setGeneratedImageUrl(storedUrl); // Use stored URL for display
        setStoredImageUrl(storedUrl);
        setIsInWishlist(false);
      } catch (storageErr) {
        console.error('Storage error:', storageErr);
        setGeneratedImageUrl(newImageUrl); // Fallback to original URL
        setError('Generated image was created but could not be saved. Some features may be limited.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
      setGeneratedImageUrl(null);
      setStoredImageUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const handleWishlistClick = () => {
    if (onAddToWishlist) {
      const imageUrl = storedImageUrl || generatedImageUrl;
      if (!imageUrl) {
        setError('No image available to add to wishlist');
        return;
      }

      if (isInWishlist) {
        onAddToWishlist(imageUrl, 'remove');
      } else {
        onAddToWishlist(imageUrl, 'add');
      }
      setIsInWishlist(!isInWishlist);
    }
  };

  const handleDownload = async () => {
    const imageUrl = storedImageUrl || generatedImageUrl;
    if (imageUrl) {
      try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        const blob = await response.blob();

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'generated-design.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      } catch (err) {
        console.error("Download error:", err);
        setError('Failed to download image. Please try again.');
      }
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 overflow-y-auto z-[100]"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose(e);
          }}
        />
        
        <div
          className="relative w-full max-w-5xl bg-[#260000] rounded-lg shadow-xl border border-yellow-400/20"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div className="flex items-center justify-between p-4 border-b border-yellow-400/20">
            <h2 className="text-xl font-semibold text-white">Generate Similar Design</h2>
            <button
              onClick={(e) => onClose(e)}
              className="p-1 hover:bg-[#3b0000] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6">
            {showInfo && (
              <div className="mb-6 p-4 bg-[#1f1f1f] border border-yellow-400/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-yellow-400">
                      Our AI will analyze the source design and generate a new, unique design inspired by it. Results may vary.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-2">
              <div className="w-full max-w-md mx-auto">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Source Design</h3>
                <img
                  src={sourceImageUrl}
                  alt="Source"
                  className="w-full aspect-square object-cover rounded-lg"
                />
              </div>
              
              <div className="flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-white" />
              </div>

              <div className="w-full max-w-md mx-auto">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Generated Design</h3>
                <div className="relative w-full aspect-square bg-gray-800 rounded-lg overflow-hidden">
                  {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-yellow-400 mx-auto mb-2" />
                        <div className="space-y-1">
                          <p className="text-sm text-gray-300">Generating design...</p>
                          <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>Estimated Time: 15-30 seconds</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : generatedImageUrl ? (
                    <>
                      <img
                        src={storedImageUrl || generatedImageUrl}
                        alt="Generated"
                        className="w-full h-full object-cover transition-opacity duration-300"
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          onClick={handleDownload}
                          disabled={!generatedImageUrl}
                          className="p-2 text-white hover:text-gray-300 transition-colors"
                          title="Download generated image"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between">
                        <button
                          onClick={handleWishlistClick}
                          disabled={!generatedImageUrl}
                          className={`flex items-center gap-2 ${
                            isInWishlist 
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-yellow-400 hover:bg-yellow-500 text-[#260000]'
                          } px-4 py-2 rounded-lg transition-colors font-medium`}
                          title="Add to wishlist"
                        >
                          {isInWishlist ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span>Added to Wishlist</span>
                            </>
                          ) : (
                            <>
                              <Heart className="w-4 h-4 text-[#260000]" />
                              <span>Add to Wishlist</span>
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                      <p className="text-sm text-gray-400">
                        Click "Generate Design" to create a new design inspired by the source image. Generated designs may vary in accuracy and style. Feel free to regenerate if the result doesn't match your expectations.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-900/30 border-2 border-red-500 rounded-lg text-red-200 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3 items-center">
              {generatedImageUrl && (
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <span>Add to Wishlist or Generate Again</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-400/70 text-[#260000] px-6 py-2.5 rounded-lg transition-colors min-w-[140px] justify-center font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#260000]" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-[#260000]" />
                    Generate Design
                  </>
                )}
              </button>

              <button
                onClick={(e) => onClose(e)}
                className="px-4 py-2.5 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white rounded-lg transition-colors border border-yellow-400/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}