import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { Trash2 } from "lucide-react";
import { SortableGalleryItem } from "./SortableGalleryItem";
import { getTags } from "../../lib/api/tags";
import type { GalleryImage } from "../../types";

interface SortableGalleryGridProps {
  images: GalleryImage[];
  onReorder: (images: GalleryImage[]) => void;
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
}

export function SortableGalleryGrid({
  images,
  onReorder,
  onDelete,
  onBulkDelete,
}: SortableGalleryGridProps) {
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    getTags().then(setAvailableTags);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((item) => item.id === active.id);
      const newIndex = images.findIndex((item) => item.id === over.id);

      const newOrder = arrayMove(images, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedImages((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedImages.size === images.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(images.map((img) => img.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedImages.size === 0) return;

    if (
      confirm(
        `Are you sure you want to delete ${selectedImages.size} selected images?`
      )
    ) {
      onBulkDelete(Array.from(selectedImages));
      setSelectedImages(new Set());
    }
  };

  return (
    <div>
      {images.length > 0 && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedImages.size === images.length}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-300">
                {selectedImages.size === 0
                  ? "Select All"
                  : `Selected ${selectedImages.size} of ${images.length}`}
              </span>
            </label>
          </div>

          {selectedImages.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected ({selectedImages.size})
            </button>
          )}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={images} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {images.map((image) => (
              <SortableGalleryItem
                key={image.id}
                image={image}
                onDelete={onDelete}
                isSelected={selectedImages.has(image.id)}
                onSelect={() => handleSelect(image.id)}
                availableTags={availableTags}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
