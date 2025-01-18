import React, { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Heart, Check, Filter } from "lucide-react";
import { getTagColor } from "../lib/utils/colors";
import type { Image } from "../types";

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
  const [columnCount, setColumnCount] = useState(3);
  const [containerWidth, setContainerWidth] = useState(0);
  const { ref, inView } = useInView({
    threshold: 0,
    onChange: (inView) => {
      if (inView) onLoadMore();
    },
  });

  // Update container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      const width = Math.min(1400, window.innerWidth - 32); // Max width minus padding
      setContainerWidth(width);
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const breakpointColumns = {
    default: columnCount,
    1100: Math.min(columnCount, 2),
    700: 1,
  };

  // Filter images based on selected gallery type and tags
  const filteredImages = images.filter((image) => {
    const matchesGalleryType = !selectedGalleryType || image.gallery_type_id === selectedGalleryType.id;
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => image.tags?.includes(tag));
    return matchesGalleryType && matchesTags;
  });

  // Calculate tag counts for current gallery type
  const tagCounts = tags.reduce((acc, tag) => {
    const count = images.filter(image => 
      (!selectedGalleryType || image.gallery_type_id === selectedGalleryType.id) && 
      image.tags?.includes(tag)
    ).length;
    acc[tag] = count;
    return acc;
  }, {} as Record<string, number>);

  // Calculate total images count for "All" tag
  const allTagsCount = images.filter(image => 
    !selectedGalleryType || image.gallery_type_id === selectedGalleryType.id
  ).length;

  // Calculate column width
  const columnWidth = Math.floor((containerWidth - (columnCount - 1) * 16) / columnCount);

  // Arrange images into columns manually
  const columns = Array.from({ length: columnCount }, () => []);
  filteredImages.forEach((image, index) => {
    const columnIndex = index % columnCount;
    columns[columnIndex].push(image);
  });

  return (
    <div className="px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        {/* Tag Filter */}
        <div className="flex-1 flex items-center gap-2 px-2 overflow-x-auto">
          {/* All Tags Option */}
          <button
            onClick={() => onSelectTags([])}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              selectedTags.length === 0
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300"
            }`}
          >
            All ({allTagsCount})
          </button>

          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                if (selectedTags.includes(tag)) {
                  onSelectTags(selectedTags.filter(t => t !== tag));
                } else {
                  onSelectTags([...selectedTags, tag]);
                }
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedTags.includes(tag)
                  ? "bg-purple-600 text-white"
                  : `${getTagColor(tag)} hover:opacity-80`
              }`}
            >
              {tag} ({tagCounts[tag] || 0})
            </button>
          ))}
        </div>

        {/* Column Selector */}
        <div className="flex items-center gap-4 bg-gray-900 rounded-lg p-2 ml-4 flex-shrink-0">
          <span className="text-sm text-gray-400">Columns:</span>
          {[2, 3, 4].map((count) => (
            <button
              key={count}
              onClick={() => setColumnCount(count)}
              className={`p-2 rounded-lg transition-colors ${
                columnCount === count ? "bg-purple-600" : "hover:bg-gray-800"
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
              <span className="sr-only">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {filteredImages.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No images match the selected filters</p>
          <p className="text-sm">Try adjusting your filter criteria</p>
        </div>
      ) : (
        <div className="flex gap-4">
          {columns.map((column, columnIndex) => (
            <div key={columnIndex} className="flex-1">
              {column.map((image) => {
                const isInWishlist = wishlistIds.includes(image.id);
                return (
                  <div
                    key={image.id}
                    className="mb-4 relative group overflow-hidden rounded-lg"
                    style={{ width: '100%' }}
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

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            isInWishlist
                              ? onRemoveFromWishlist(image.id)
                              : onAddToWishlist(image);
                          }}
                          className={`mt-2 flex items-center gap-2 ${
                            isInWishlist
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-purple-600 hover:bg-purple-700"
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
              })}
            </div>
          ))}
        </div>
      )}
      <div ref={ref} className="h-10" />
    </div>
  );
}