import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, GripVertical, Tag as TagIcon } from "lucide-react";
import { ImageTagsEditor } from "./ImageTagsEditor";
import { Modal } from "../Modal";
import { updateImageTags } from "../../lib/api/tags";
import type { GalleryImage } from "../../types";

interface SortableGalleryItemProps {
  image: GalleryImage;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: () => void;
  availableTags: string[];
}

export function SortableGalleryItem({
  image,
  onDelete,
  isSelected,
  onSelect,
  availableTags,
}: SortableGalleryItemProps) {
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [selectedTags, setSelectedTags] = useState(image.tags || []);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleAddTag = async (tag: string) => {
    const newTags = [...selectedTags, tag];
    setSelectedTags(newTags);
    try {
      await updateImageTags(image.id, newTags);
    } catch (error) {
      console.error("Failed to update tags:", error);
      setSelectedTags(selectedTags); // Revert on error
    }
  };

  const handleRemoveTag = async (tag: string) => {
    const newTags = selectedTags.filter((t) => t !== tag);
    setSelectedTags(newTags);
    try {
      await updateImageTags(image.id, newTags);
    } catch (error) {
      console.error("Failed to update tags:", error);
      setSelectedTags(selectedTags); // Revert on error
    }
  };

  return (
    <div className="relative">
      <div
        ref={setNodeRef}
        style={style}
        className={`
          bg-gray-900 rounded-lg overflow-hidden group
          ${isDragging ? "shadow-2xl ring-2 ring-purple-500" : ""}
          ${isSelected ? "ring-2 ring-purple-500" : ""}
        `}
      >
        <div className="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="w-4 h-4 rounded border-gray-700 bg-gray-800/50 text-purple-600 focus:ring-purple-500"
          />
        </div>

        <div className="aspect-square relative">
          <img
            src={image.url}
            alt={image.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              {...attributes}
              {...listeners}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/75 p-1.5 rounded-lg transition-colors cursor-grab active:cursor-grabbing"
              title="Drag to reorder"
            >
              <GripVertical className="w-4 h-4 text-white" />
            </button>

            <div className="absolute bottom-2 left-2 right-24 flex flex-wrap gap-1">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="bg-black/50 text-white text-xs px-2 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="absolute bottom-2 right-2 flex gap-2">
              <button
                onClick={() => setIsEditingTags(true)}
                className="bg-purple-600 hover:bg-purple-700 p-1.5 rounded-lg transition-colors"
                title="Edit tags"
              >
                <TagIcon className="w-4 h-4" />
              </button>

              <button
                onClick={() => onDelete(image.id)}
                className="bg-red-500 hover:bg-red-600 p-1.5 rounded-lg transition-colors"
                title="Delete image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isEditingTags}
        onClose={() => setIsEditingTags(false)}
        title="Edit Image Tags"
      >
        <ImageTagsEditor
          tags={availableTags}
          selectedTags={selectedTags}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          onClose={() => setIsEditingTags(false)}
        />
      </Modal>
    </div>
  );
}
