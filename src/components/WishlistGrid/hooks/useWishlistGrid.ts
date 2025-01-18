import { useState } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { ViewMode } from '../types';
import type { WishlistItem, QuoteRequest } from '../../../types';

export function useWishlistGrid(
  items: WishlistItem[],
  onReorder: (items: WishlistItem[]) => void,
  onQuoteSubmit: (data: QuoteRequest) => void
) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragEnd = (event: DragEndEvent) => {
    try {
      const { active, over } = event;
      
      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(items, oldIndex, newIndex);
        onReorder(newItems);
      }
    } catch (err) {
      console.error('Error reordering items:', err);
      setError('Failed to reorder items');
    }
  };

  const handleQuoteSubmit = async (data: QuoteRequest) => {
    try {
      setError(null);
      await onQuoteSubmit(data);
      setIsQuoteModalOpen(false);
    } catch (err) {
      console.error('Error submitting quote:', err);
      setError('Failed to submit quote request');
    }
  };

  const handleUpload = (image: WishlistItem) => {
    try {
      setError(null);
      onReorder([...items, image]);
      setIsUploadModalOpen(false);
    } catch (err) {
      console.error('Error adding uploaded image:', err);
      setError('Failed to add uploaded image');
    }
  };

  return {
    viewMode,
    setViewMode,
    isQuoteModalOpen,
    setIsQuoteModalOpen,
    isUploadModalOpen,
    setIsUploadModalOpen,
    error,
    handleDragEnd,
    handleQuoteSubmit,
    handleUpload
  };
}