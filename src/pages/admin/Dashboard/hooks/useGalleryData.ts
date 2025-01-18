import { useState, useEffect, useCallback } from 'react';
import { loadGalleryImages } from '../../../../lib/api/gallery';
import { getTags } from '../../../../lib/api/tags';
import type { GalleryImage } from '../../../../types';

export function useGalleryData() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [imageData, tagData] = await Promise.all([
        loadGalleryImages(),
        getTags()
      ]);

      setImages(imageData as GalleryImage[]);
      setTags(tagData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    images,
    tags,
    loading,
    error,
    reloadData: loadData
  };
}