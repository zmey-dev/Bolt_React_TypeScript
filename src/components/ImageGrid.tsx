import React, { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Wand2, Heart, Check, Gift, Bot, ChevronDown, X, Loader2 } from "lucide-react";
import { GenerateImageModal } from "./GenerateImageModal";
import { getTagColor } from "../lib/utils/colors";
import type { Image } from "../types";

const IMAGES_PER_PAGE = 12; // Number of images to load initially and per scroll

interface ImageGridProps {
  images: Image[];
  wishlistIds: string[];
  galleryTypes: Array<{ id: string; name: string }>;
  selectedGalleryType: { id: string; name: string } | null;
  tags: string[];
  selectedTags: string[];
  onAddToWishlist: (image: Image) => void;
  onRemoveFromWishlist: (id: string) => void;
  onLoadMore: () => void;
  setImageUrl: (url: string) => void;
  setIsOpen: (isOpen: boolean) => void;
  onSelectGalleryType: (type: { id: string; name: string } | null) => void;
  onSelectTags: (tags: string[]) => void;
}

export function ImageGrid({
  images,
  wishlistIds,
  galleryTypes,
  selectedGalleryType,
  tags,
  selectedTags,
  onAddToWishlist,
  onRemoveFromWishlist,
  onLoadMore,
  setImageUrl,
  setIsOpen,
  onSelectGalleryType,
  onSelectTags,
}: ImageGridProps) {
  const [columnCount, setColumnCount] = useState(window.innerWidth <= 640 ? 2 : 3);
  const [containerWidth, setContainerWidth] = useState(0);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [visibleImages, setVisibleImages] = useState<Image[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [generateModal, setGenerateModal] = useState<{
    isOpen: boolean;
    sourceImageUrl: string | null;
  }>({
    isOpen: false,
    sourceImageUrl: null,
  });

  const handleAddGeneratedToWishlist = useCallback(
    (imageUrl: string) => {
      onAddToWishlist({
        id: crypto.randomUUID(),
        url: imageUrl,
        title: "Generated Design",
        description: "AI-generated design",
        width: 1024,
        height: 1024,
      });
    },
    [onAddToWishlist]
  );

  const { ref, inView } = useInView({
    threshold: 0,
    onChange: async (inView) => {
      if (inView && hasMore && !loadingMore) {
        setLoadingMore(true);
        const nextPage = page + 1;
        const start = (nextPage - 1) * IMAGES_PER_PAGE;
        const end = start + IMAGES_PER_PAGE;
        
        // Filter images based on selected gallery type and tags
        const filteredImages = images.filter((image) => {
          const matchesGalleryType =
            !selectedGalleryType || image.gallery_type_id === selectedGalleryType.id;
          const matchesTags =
            selectedTags.length === 0 ||
            selectedTags.some((tag) =>
              image.tags?.filter((image_tag) => image_tag.id == tag.id).length
            );
          return matchesGalleryType && matchesTags;
        });

        const newImages = filteredImages.slice(start, end);
        if (newImages.length > 0) {
          setVisibleImages(prev => [...prev, ...newImages]);
          setPage(nextPage);
        } else {
          setHasMore(false);
        }
        setLoadingMore(false);
      }
    },
  });

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    const initialImages = filteredImages.slice(0, IMAGES_PER_PAGE);
    setVisibleImages(initialImages);
  }, [selectedGalleryType, selectedTags]);

  // Update container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      const width = Math.min(1400, window.innerWidth - 32); // Max width minus padding
      const isMobile = window.innerWidth <= 640;
      setColumnCount(prev => {
        // Only update if crossing the mobile breakpoint
        if (isMobile && prev > 2) return 2;
        if (!isMobile && prev === 2) return 3;
        return prev;
      });
      setContainerWidth(width);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const breakpointColumns = {
    default: columnCount,
    1100: Math.min(columnCount, 2),
    700: 1,
  };

  // Filter images based on selected gallery type and tags
  const filteredImages = images.filter((image) => {
    const matchesGalleryType =
      !selectedGalleryType || image.gallery_type_id === selectedGalleryType.id;
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) =>
        image.tags?.filter((image_tag) => image_tag.id == tag.id).length
      );
    return matchesGalleryType && matchesTags;
  });

  // Calculate tag counts for current gallery type
  const tagCounts = tags.reduce((acc, tag) => {
    const count = images.filter(
      (image) =>
        (!selectedGalleryType ||
          image.gallery_type_id === selectedGalleryType.id) &&
        image.tags?.filter((image_tag) => image_tag.id == tag.id).length
    ).length;

    acc[tag.id] = count;
    return acc;
  }, {} as Record<string, number>);

  // Calculate total images count for "All" tag
  const allTagsCount = images.filter(
    (image) =>
      !selectedGalleryType || image.gallery_type_id === selectedGalleryType.id
  ).length;

  // Calculate column width
  const columnWidth = Math.floor(
    (containerWidth - (columnCount - 1) * 16) / columnCount
  );

  // Arrange images into columns manually
  const columns = Array.from({ length: columnCount }, () => []);
  visibleImages.forEach((image, index) => {
    const columnIndex = index % columnCount;
    columns[columnIndex].push(image);
  });

  return (
    <div className="px-4 pt-14 pb-8 md:pt-8 custom-scrollbar">
      {/* Gallery Type Selector */}
      <div className="flex justify-center mb-3 relative z-10">
  <div className="flex items-center gap-3 bg-[#260000]/80 backdrop-blur-sm rounded-full px-4 py-2 border border-yellow-400 shadow-lg hover:shadow-yellow-400/10 transition-all max-w-[95vw] md:max-w-none">
    {galleryTypes.map((type, index) => (
      <button
        key={type.id}
        onClick={() => onSelectGalleryType(type)}
        className={`${
          window.innerWidth <= 640 
            ? 'px-3 py-1.5 text-sm gap-1.5 flex-1'
            : 'px-5 py-2.5 text-base gap-2'
        } font-medium rounded-full transition-all flex items-center justify-center ${
          selectedGalleryType?.id === type.id
            ? "bg-yellow-400 text-[#260000] shadow-md scale-105" // Selected state
            : "text-gray-300 hover:bg-gray-800/50 hover:scale-102" // Default state
        }`}
      >
        {index === 0 && <Gift className={window.innerWidth <= 640 ? "w-4 h-4" : "w-6 h-6"} />}
        {index === 1 && <Bot className={window.innerWidth <= 640 ? "w-4 h-4" : "w-6 h-6"} />}
        {type.name}
      </button>
    ))}
  </div>
</div>

      <div className="flex items-center justify-between mb-3">
        {/* Tag Filter */}
        <div className="relative flex-1 z-20">
          {/* Mobile Dropdown Button */}
          <button
            onClick={() => setShowTagDropdown(!showTagDropdown)}
            className="sm:hidden w-full flex items-center justify-between bg-[#1f1f1f] text-white border-2 border-yellow-400/20 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400/50"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-yellow-400" />
              <span>
                {selectedTags.length === 0
                  ? "All Tags"
                  : `${selectedTags.length} Selected`}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${showTagDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Mobile Tag Dropdown */}
          {showTagDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1f1f1f] border-2 border-yellow-400/20 rounded-lg shadow-lg p-4 sm:hidden max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto scrollbar-none">
                <button
                  onClick={() => {
                    onSelectTags([]);
                    setShowTagDropdown(false);
                  }}
                  className={`flex items-center justify-between px-2.5 py-1.5 text-xs rounded-full border-2 transition-all ${
                    selectedTags.length === 0
                      ? "bg-yellow-400 border-yellow-400 text-[#260000] font-medium"
                      : "bg-transparent border-gray-600 text-gray-300 font-medium hover:border-yellow-400 hover:text-yellow-400"
                  }`}
                >
                  <span>All ({allTagsCount})</span>
                  {selectedTags.length === 0 && <Check className="w-3 h-3" />}
                </button>
                {tags
                  .filter((tag) => tag.gallery_type_id == selectedGalleryType?.id)
                  .map((tag) => (
                    <button
                      key={`tag-${tag.id}`}
                      onClick={() => {
                        if (selectedTags.includes(tag)) {
                          onSelectTags(selectedTags.filter((t) => t !== tag));
                        } else {
                          onSelectTags([...selectedTags, tag]);
                        }
                      }}
                      className={`flex items-center justify-between px-3 py-1 text-sm rounded-full border-2 transition-all ${
                        selectedTags.includes(tag)
                          ? "bg-yellow-400 border-yellow-400 text-[#260000] font-medium"
                          : "bg-transparent border-gray-600 text-gray-300 font-medium hover:border-yellow-400 hover:text-yellow-400"
                      }`}
                    >
                      <span>{tag.name} ({tagCounts[tag.id] || 0})</span>
                      {selectedTags.includes(tag) && <Check className="w-4 h-4" />}
                    </button>
                  ))}
              </div>
              <button
                onClick={() => setShowTagDropdown(false)}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-[#260000] text-white border-2 border-yellow-400/20 rounded-full px-4 py-2 hover:border-yellow-400/50 transition-all"
              >
                <X className="w-4 h-4" />
                Close
              </button>
            </div>
          )}

          {/* Desktop Tag List */}
          <div className="hidden sm:flex items-center gap-2 px-2 overflow-x-auto">
          {/* All Tags Option */}
          <button
            onClick={() => onSelectTags([])}
            className={`px-3 py-1 text-sm rounded-full border-2 whitespace-nowrap transition-all snap-start flex-shrink-0 ${
              selectedTags.length === 0
                ? "bg-yellow-400 border-yellow-400 text-[#260000] font-medium"
                : "bg-transparent border-gray-600 text-gray-300 font-medium hover:border-yellow-400 hover:text-yellow-400"
            }`}
          >
            All ({allTagsCount})
          </button>
          {tags
  .filter((tag) => tag.gallery_type_id == selectedGalleryType?.id)
  .map((tag) => (
    <button
      key={`tag-${tag.id}`}
      onClick={() => {
        if (selectedTags.includes(tag)) {
          onSelectTags(selectedTags.filter((t) => t !== tag));
        } else {
          onSelectTags([...selectedTags, tag]);
        }
      }}
      className={`px-4 py-1.5 text-sm rounded-full border border-yellow-400 whitespace-nowrap transition-all snap-start flex-shrink-0 ${
        selectedTags.includes(tag)
          ? "bg-yellow-400 text-[#260000] font-medium" // Selected state
          : "bg-[#260000] text-gray-300 font-medium hover:bg-yellow-400 hover:text-[#260000]" // Default state with hover effect
      }`}
    >
      {tag.name} ({tagCounts[tag.id] || 0})
    </button>
  ))}
          </div>
        </div>

        {/* Column Selector */}
        <div className="flex items-center gap-2 bg-[#260000] rounded-lg p-1.5 ml-4 flex-shrink-0 border border-yellow-400">
  {[1, 2, 3, 4, 5].map((count) => (
    <button
      key={count}
      onClick={() => setColumnCount(count)}
      className={`p-1.5 rounded-lg transition-colors ${
        count === 1 ? 'flex sm:hidden' : // Show 1 column only on mobile
        count === 2 ? 'flex' : // Always show 2 columns
        count === 3 ? 'hidden sm:flex' : // Show 3 columns on tablet and up
        'hidden lg:flex' // Show 3+ columns only on desktop
      } ${
        columnCount === count
          ? "bg-yellow-400 text-[#260000]"
          : "hover:bg-[#3b0000]"
      }`}
      aria-label={`Show ${count} columns`}
    >
      <div className="flex gap-0.5">
        {Array(count)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="w-1 h-5 bg-current rounded-sm" />
          ))}
      </div>
    </button>
  ))}
</div>
      </div>

      {visibleImages.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No images match the selected filters</p>
          <p className="text-sm">Try adjusting your filter criteria</p>
        </div>
      ) : (
        <div className="flex gap-4">
          {columns.map((column, columnIndex) => (
            <div key={`column-${columnIndex}`} className="flex-1">
              {column.map((image) => {
                const isInWishlist = wishlistIds.includes(image.id);
                return (
                  <div
  key={`image-${image.id}`}
  className="mb-4 relative group overflow-hidden rounded-lg border border-yellow-400/50 transition-all duration-300 touch-manipulation" // 50% opacity
  style={{ width: "100%" }}
  onClick={() => {
    setImageUrl(image.url);
    setIsOpen(true);
  }}
>
  <img
    src={image.url}
    alt={image.title}
    className="w-full h-auto rounded-lg transform transition-transform duration-300 group-hover:scale-105 object-cover"
    loading="lazy"
  />

  {/* Hover Overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition-opacity duration-300">
    <div className="absolute bottom-0 left-0 right-0 p-2 w-full">
      <div className="flex items-center gap-2 justify-center flex-wrap">
        {/* Add to Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            isInWishlist
              ? onRemoveFromWishlist(image.id)
              : onAddToWishlist(image);
          }}
          className={`flex items-center gap-1 sm:gap-2 ${
            columnCount <= 3
              ? "h-[40px] px-4 py-2 text-base"
              : "h-7 px-2 py-1 text-xs sm:h-8 sm:px-3 sm:py-1 sm:text-sm"
          } rounded-lg transition-colors ${
            isInWishlist
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-yellow-400 hover:bg-yellow-500 text-[#260000]"
          } font-medium whitespace-nowrap`}
        >
          {isInWishlist ? (
            <>
              <Check className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="sm:inline hidden">Added to Wishlist</span>
              <span className="sm:hidden inline">Added</span>
            </>
          ) : (
            <>
              <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="sm:inline hidden">Add to Wishlist</span>
              <span className="sm:hidden inline">Add</span>
            </>
          )}
        </button>

        {/* Generate Similar Design Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setGenerateModal({
              isOpen: true,
              sourceImageUrl: image.url,
            });
          }}
          className={`flex items-center gap-1 sm:gap-2 ${
            columnCount <= 3
              ? "h-[40px] px-4 py-2 text-base"
              : "h-7 px-2 py-1 text-xs sm:h-8 sm:px-3 sm:py-1 sm:text-sm"
          } bg-yellow-400 hover:bg-yellow-500 text-[#260000] font-medium rounded-lg transition-colors whitespace-nowrap`}
        >
          <Wand2 className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="sm:inline hidden">Generate Similar Design</span>
          <span className="sm:hidden inline">Generate</span>
        </button>
      </div>
    </div>
  </div>
</div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Loading indicator */}
      {loadingMore && (
        <div className="flex justify-center mt-8">
          <div className="bg-[#1f1f1f] px-4 py-2 rounded-lg text-gray-400 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading more images...
          </div>
        </div>
      )}

      {generateModal.sourceImageUrl && (
        <GenerateImageModal
          isOpen={generateModal.isOpen}
          onClose={() =>
            setGenerateModal({ isOpen: false, sourceImageUrl: null })
          }
          sourceImageUrl={generateModal.sourceImageUrl}
          onAddToWishlist={handleAddGeneratedToWishlist}
        />
      )}
      <div ref={ref} className="h-10" />
    </div>
  );
}