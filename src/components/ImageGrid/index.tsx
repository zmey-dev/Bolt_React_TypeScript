import React from 'react';
import Masonry from 'react-masonry-css';
import { useInView } from 'react-intersection-observer';
import { ImageIcon } from 'lucide-react';
import { Image } from '../../types';
import { ColumnSelector } from './ColumnSelector';
import { ImageCard } from './ImageCard';
import { useColumnLayout } from './hooks/useColumnLayout';

interface ImageGridProps {
  images: Image[];
  wishlistIds: string[];
  onAddToWishlist: (image: Image) => void;
  onRemoveFromWishlist: (id: string) => void;
  onLoadMore: () => void;
}

export function ImageGrid({ 
  images, 
  wishlistIds,
  onAddToWishlist, 
  onRemoveFromWishlist,
  onLoadMore 
}: ImageGridProps) {
  const { columnCount, setColumnCount, breakpointColumns, availableColumns } = useColumnLayout();
  const { ref } = useInView({
    threshold: 0,
    onChange: (inView) => {
      if (inView) onLoadMore();
    },
  });

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
        <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-xl mb-2">No images available</p>
        <p className="text-sm">Images uploaded by admin will appear here</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="sticky top-[72px] z-40 mb-8">
          <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-800 rounded-lg p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="text-lg font-medium text-white">Tag Filter</div>
              
              <div className="flex-shrink-0 w-full md:w-auto">
                <ColumnSelector
                  columnCount={columnCount}
                  onColumnChange={setColumnCount}
                  availableColumns={availableColumns}
                />
              </div>
            </div>
          </div>
        </div>

        <Masonry
          breakpointCols={breakpointColumns}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {images.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              isInWishlist={wishlistIds.includes(image.id)}
              onAddToWishlist={onAddToWishlist}
              onRemoveFromWishlist={onRemoveFromWishlist}
            />
          ))}
        </Masonry>
        
        <div ref={ref} className="h-10" />
      </div>
    </div>
  );
}