import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Heart, Check } from "lucide-react";
import React, { useState, useCallback, useEffect } from "react";
import { Image } from "../types";

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
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Reset zoom and position when image changes
  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [index]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((currentZoom) => {
      const newZoom = currentZoom - (e.deltaY * ZOOM_STEP) / 100;
      return Math.min(Math.max(newZoom, MIN_ZOOM), MAX_ZOOM);
    });
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom > 1) {
        setIsDragging(true);
        setDragStart({
          x: e.clientX - position.x,
          y: e.clientY - position.y,
        });
      }
    },
    [zoom, position]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging && zoom > 1) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    },
    [isDragging, zoom, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onLeft = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIndex((index - 1 + images.length) % images.length);
    },
    [images.length, index, setIndex]
  );

  const onRight = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIndex((index + 1) % images.length);
    },
    [images.length, index, setIndex]
  );

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
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transition: isDragging ? "none" : "transform 0.2s ease-out",
            cursor: zoom > 1 ? "grab" : "default",
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
              setZoom((z) => Math.max(z - ZOOM_STEP * 5, MIN_ZOOM));
            }}
            className="text-white hover:text-purple-400 transition-colors"
            disabled={zoom <= MIN_ZOOM}
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-white min-w-[3em] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setZoom((z) => Math.min(z + ZOOM_STEP * 5, MAX_ZOOM));
            }}
            className="text-white hover:text-purple-400 transition-colors"
            disabled={zoom >= MAX_ZOOM}
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Controls */}
        {images.length > 1 && (
          <>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white rounded-full p-2 transition-colors"
              onClick={onLeft}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white rounded-full p-2 transition-colors"
              onClick={onRight}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Close Button */}
        <button
          className="absolute top-4 right-4 bg-black/50 hover:bg-black/75 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Wishlist Button */}
        {onAddToWishlist && onRemoveFromWishlist && (
          <button
            onClick={handleWishlistClick}
            className={`absolute top-4 left-4 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isInWishlist
                ? "bg-green-600 hover:bg-green-700"
                : "bg-purple-600 hover:bg-purple-700"
            } text-white`}
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
        )}
      </div>
    </div>
  );
};

export default ImageModal;