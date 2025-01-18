import { useState, useMemo } from 'react';
import type { Image } from '../../../types';

export function useImageFilters(images: Image[]) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get unique tags from all images
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    images.forEach(image => {
      if (image.tags) {
        image.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [images]);

  // Filter images by selected tag
  const filteredImages = useMemo(() => {
    if (!selectedTag) return images;
    return images.filter(image => image.tags?.includes(selectedTag));
  }, [images, selectedTag]);

  return {
    selectedTag,
    setSelectedTag,
    filteredImages,
    availableTags
  };
}