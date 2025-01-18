import { useState, useCallback } from 'react';
import { uploadMultipleImages } from '../../../../lib/api/upload';
import type { GalleryImage } from '../../../../types';

export function useImageUpload(images: GalleryImage[], onSuccess: () => void) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    try {
      setUploading(true);
      const startOrder = images.length > 0 
        ? Math.max(...images.map(img => img.display_order || 0)) + 1 
        : 1;

      await uploadMultipleImages(event.target.files, startOrder);
      onSuccess();
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setUploading(false);
    }
  }, [images, onSuccess]);

  return { uploading, handleUpload };
}