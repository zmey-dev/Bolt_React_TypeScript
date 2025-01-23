import React, { useState } from 'react';
import { X, Loader2, Wand2, Download, Heart, Check, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { storeGeneratedImage } from '../lib/api/storage/generated';

interface DesignGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToWishlist: (imageUrl: string, action: 'add' | 'remove') => void;
}

export function DesignGeneratorModal({
  isOpen,
  onClose,
  onAddToWishlist,
}: DesignGeneratorModalProps) {
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wishlistStatuses, setWishlistStatuses] = useState<Record<string, boolean>>({});
  const [storedUrls, setStoredUrls] = useState<Record<string, string>>({});
  const [processingImages, setProcessingImages] = useState<Set<string>>(new Set());

  // Updated prompts array with the new list of names
  const prompts = [
    'Santa Claus',
    'Snowman',
    'Reindeer',
    'Christmas Tree',
    'Gift Box',
    'Candy Cane',
    'Ornament Ball',
    'Angel',
    'Santa Sleigh',
    'Star',
    'Penguin',
    'Bear',
    'Nutcracker',
    'Christmas Train',
    'Christmas Stocking',
    'Snowflake',
    'Heart',
    'Castle',
    'Jingle Bell'
  ];

  const handleGenerate = async () => {
    if (!selectedPrompt) return;

    try {
      setIsGenerating(true);
      setError(null);
      setGeneratedImages([]);

      // Generate two images in parallel
      const responses = await Promise.all([
        generateImage(selectedPrompt),
        generateImage(selectedPrompt),
      ]);

      setGeneratedImages(responses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate images');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImage = async (prompt: string): Promise<string> => {
    const dallePrompt = `Design an LED motif light fairly large sized display of a ${prompt}, perfectly displayed at an outdoor Christmas light show. The design should feature a bold glow and clean lines.`;

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: dallePrompt,
        size: '1024x1024',
        quality: 'hd',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate image');
    }

    const data = await response.json();
    return data.data[0].url;
  };

  const handleStoreImage = async (imageUrl: string) => {
    try {
      // Store the image and get the new URL
      let storedUrl;
      try {
        storedUrl = await storeGeneratedImage(imageUrl);
      } catch (storageErr) {
        console.error('Storage error:', storageErr);
        setError('Generated image was created but could not be saved. Some features may be limited.');
        return imageUrl; // Fallback to original URL
      }
      
      // Update the stored URLs mapping
      setStoredUrls(prev => ({
        ...prev,
        [imageUrl]: storedUrl
      }));

      return storedUrl;
    } catch (err) {
      console.error('Error storing image:', err);
      return imageUrl;
    }
  };

  const handleDownload = async (imageUrl: string) => {
    try {
      // Use stored URL if available, otherwise store it first
      const downloadUrl = storedUrls[imageUrl] || await handleStoreImage(imageUrl);
      
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'generated-design.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download image. Please try again.');
    }
  };

  const handleWishlistClick = async (imageUrl: string) => {
    setProcessingImages(prev => new Set([...prev, imageUrl]));
    setError(null);
    const storedUrl = storedUrls[imageUrl] || imageUrl;

    if (wishlistStatuses[imageUrl]) {
      // Remove from wishlist
      try {
        onAddToWishlist(storedUrl, 'remove');
        setWishlistStatuses(prev => ({
          ...prev,
          [imageUrl]: false
        }));
      } catch (err) {
        console.error('Failed to remove from wishlist:', err);
        setError('Failed to remove image from wishlist');
      }
    } else {
      // Add to wishlist
      try {
        // Store the image first if not already stored
        let storedUrl = storedUrls[imageUrl];
        if (!storedUrl) {
          try {
            storedUrl = await handleStoreImage(imageUrl);
            setStoredUrls(prev => ({
              ...prev,
              [imageUrl]: storedUrl
            }));
          } catch (storageErr) {
            console.error('Storage error:', storageErr);
            storedUrl = imageUrl; // Fallback to original URL
          }
        }
        
        onAddToWishlist(storedUrl, 'add');
        setWishlistStatuses(prev => ({
          ...prev,
          [imageUrl]: true
        }));
      } catch (err) {
        console.error('Failed to add to wishlist:', err);
        setError('Failed to add image to wishlist');
      }
    }
    setProcessingImages(prev => {
      const next = new Set(prev);
      next.delete(imageUrl);
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <div className="relative w-full max-w-5xl bg-[#260000] rounded-lg shadow-xl border border-yellow-400/20">
          <div className="flex items-center justify-between p-4 border-b border-yellow-400/20">
            <h2 className="text-xl font-semibold text-white">Generate New Design</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-[#3b0000] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Predefined Prompt Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {prompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setSelectedPrompt(prompt)}
                  className={`px-3 py-1 text-sm rounded-full border-2 transition-all ${
                    selectedPrompt === prompt
                      ? 'bg-yellow-400 border-yellow-400 text-[#260000] font-medium'
                      : 'bg-transparent border-gray-600 text-gray-300 font-medium hover:border-yellow-400 hover:text-yellow-400'
                  }`}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Two Boxes for Generated Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[0, 1].map((index) => (
                <div
                  key={index}
                  className="relative aspect-square bg-[#1f1f1f] rounded-lg overflow-hidden border border-yellow-400/20"
                >
                  {isGenerating ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-yellow-400 mx-auto mb-2" />
                        <div className="space-y-1">
                          <p className="text-sm text-gray-300">Generating design...</p>
                          <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>Estimated Time: 15-30 seconds</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : generatedImages[index] ? (
                    <>
                      <img
                        src={generatedImages[index]}
                        alt={`Generated design ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {/* Hover overlay for download button */}
                      <div className="absolute inset-0 bg-transparent opacity-0 hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDownload(generatedImages[index])}
                          className="absolute bottom-4 right-4 text-white transition-colors"
                          title="Download image"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                      {/* Always visible wishlist button */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <button
                          onClick={() => handleWishlistClick(generatedImages[index])}
                          disabled={processingImages.has(generatedImages[index])}
                          className={`flex items-center gap-2 ${
                            wishlistStatuses[generatedImages[index]]
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-yellow-400 hover:bg-yellow-500 text-[#260000]'
                          } px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {processingImages.has(generatedImages[index]) ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Processing...
                            </>
                          ) : wishlistStatuses[generatedImages[index]] ? (
                            <>
                              <Check className="w-4 h-4" />
                              Added to Wishlist
                            </>
                          ) : (
                            <>
                              <Heart className="w-4 h-4 text-[#260000]" />
                              Add to Wishlist
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDownload(generatedImages[index])}
                          className="absolute bottom-4 right-4 p-2 hover:bg-black/20 rounded-lg text-white transition-colors"
                          title="Download image"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                      <p className="text-sm text-gray-400">
                        Select a design option above then click "Generate Designs" to create a new design. Generated designs may vary in accuracy and style. Feel free to regenerate if the result doesn't match your expectations.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-900/30 border-2 border-red-500 rounded-lg text-red-200 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* Generate Button with Additional Text */}
            <div className="mt-6 flex justify-end gap-3 items-center">
              {generatedImages.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <span>Add to Wishlist or Generate Again</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !selectedPrompt}
                className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-400/70 text-[#260000] px-6 py-2.5 rounded-lg transition-colors min-w-[140px] justify-center font-medium"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#260000]" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-[#260000]" />
                    Generate Designs
                  </>
                )}
              </button>

              <button
                onClick={onClose}
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