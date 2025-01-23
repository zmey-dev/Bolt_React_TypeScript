import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Heart, Check, Wand2, X } from "lucide-react";
import { GenerateImageModal } from "./GenerateImageModal";
import type { Image } from "../types";

interface ImageModalProps {
  images: Image[];
  index: number;
  isOpen: boolean;
  onClose: () => void;
  setIndex: (index: number) => void;
  wishlistIds?: string[];
  onAddToWishlist?: (image: Image) => void;
  onRemoveFromWishlist?: (id: string) => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.1;

const ImageModal: React.FC<ImageModalProps> = ({
  images,
  index,
  isOpen,
  onClose,
  setIndex,
  wishlistIds = [],
  onAddToWishlist,
  onRemoveFromWishlist,
}) => {
  // Group all useState hooks together at the top
  const [state, setState] = useState({
    zoom: 1,
    position: { x: 0, y: 0 },
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    showGenerateModal: false
  });

  // Reset zoom and position when image changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      zoom: 1,
      position: { x: 0, y: 0 }
    }));
  }, [index]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setState(prev => ({
      ...prev,
      zoom: Math.min(Math.max(prev.zoom - (e.deltaY * ZOOM_STEP) / 100, MIN_ZOOM), MAX_ZOOM)
    }));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (state.zoom > 1) {
      setState(prev => ({
        ...prev,
        isDragging: true,
        dragStart: {
          x: e.clientX - prev.position.x,
          y: e.clientY - prev.position.y,
        }
      }));
    }
  }, [state.zoom]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (state.isDragging && state.zoom > 1) {
      setState(prev => ({
        ...prev,
        position: {
          x: e.clientX - prev.dragStart.x,
          y: e.clientY - prev.dragStart.y,
        }
      }));
    }
  }, [state.isDragging, state.zoom]);

  const handleMouseUp = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDragging: false
    }));
  }, []);

  const handleNavigate = useCallback((direction: 'left' | 'right') => (e: React.MouseEvent) => {
    e.stopPropagation();
    const newIndex = direction === 'left' 
      ? (index - 1 + images.length) % images.length
      : (index + 1) % images.length;
    setIndex(newIndex);
  }, [index, images.length, setIndex]);

  const handleAddGeneratedToWishlist = useCallback((imageUrl: string) => {
    if (onAddToWishlist) {
      onAddToWishlist({
        id: crypto.randomUUID(),
        url: imageUrl,
        title: 'Generated Design',
        description: 'AI-generated design',
        width: 1024,
        height: 1024
      });
    }
  }, [onAddToWishlist]);

  // Guard against invalid index or empty images array
  if (!isOpen || !images.length || index < 0 || index >= images.length) {
    return null;
  }

  const currentImage = images[index];
  const isInWishlist = wishlistIds.includes(currentImage.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInWishlist && onRemoveFromWishlist) {
      onRemoveFromWishlist(currentImage.id);
    } else if (onAddToWishlist) {
      onAddToWishlist(currentImage);
    }
  };

  return (
    <div
      className="fixed w-screen h-screen inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50"
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onWheel={handleWheel}
      >
        <img
          src={currentImage.url}
          alt={currentImage.title || ""}
          style={{
            transform: `translate(${state.position.x}px, ${state.position.y}px) scale(${state.zoom})`,
            transition: state.isDragging ? "none" : "transform 0.2s ease-out",
            cursor: state.zoom > 1 ? "grab" : "default",
          }}
          className="max-w-[90vw] max-h-[90vh] object-contain select-none"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={handleMouseDown}
          draggable={false}
        />

        {/* Zoom Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black/50 rounded-full px-4 py-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setState(prev => ({
                ...prev,
                zoom: Math.max(prev.zoom - ZOOM_STEP * 5, MIN_ZOOM)
              }));
            }}
            className="text-white hover:text-yellow-400 transition-colors"
            disabled={state.zoom <= MIN_ZOOM}
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-white min-w-[3em] text-center">
            {Math.round(state.zoom * 100)}%
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setState(prev => ({
                ...prev,
                zoom: Math.min(prev.zoom + ZOOM_STEP * 5, MAX_ZOOM)
              }));
            }}
            className="text-white hover:text-yellow-400 transition-colors"
            disabled={state.zoom >= MAX_ZOOM}
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Controls */}
        {images.length > 1 && (
          <>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white hover:text-yellow-400 rounded-full p-2 transition-colors"
              onClick={handleNavigate('left')}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white hover:text-yellow-400 rounded-full p-2 transition-colors"
              onClick={handleNavigate('right')}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Close Button */}
        <button
          className="absolute top-4 right-4 bg-black/50 hover:bg-black/75 text-white hover:text-yellow-400 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Wishlist Button */}
        {onAddToWishlist && onRemoveFromWishlist && (
          <div className="absolute top-4 left-4 flex items-center gap-2 z-[51]">
            <button
              onClick={handleWishlistClick}
              className={`flex items-center gap-2 h-[40px] px-4 py-2 rounded-lg transition-colors ${
                isInWishlist
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-yellow-400 hover:bg-yellow-500 text-[#260000] font-medium"
              }`}
            >
              {isInWishlist ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="font-medium">Added to Wishlist</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 text-[#260000]" />
                  <span className="font-medium">Add to Wishlist</span>
                </>
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setState(prev => ({ ...prev, showGenerateModal: true }));
              }}
              className="flex items-center gap-2 h-[40px] px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-[#260000] font-medium rounded-lg transition-colors"
            >
              <Wand2 className="w-4 h-4 text-[#260000]" />
              Generate Similar Design
            </button>
          </div>
        )}
      </div>
      <GenerateImageModal
        isOpen={state.showGenerateModal}
        onClose={(e?: React.MouseEvent) => {
          if (e) {
            e.preventDefault();
            e.stopPropagation();
          }
          setState(prev => ({ ...prev, showGenerateModal: false }));
        }}
        sourceImageUrl={currentImage.url}
        onAddToWishlist={handleAddGeneratedToWishlist}
      />
    </div>
  );
};

export default ImageModal;