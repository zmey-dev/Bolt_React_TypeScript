import React, { useState } from "react";
import {
  Plus,
  X,
  Tag as TagIcon,
  Loader2,
  GalleryHorizontalIcon,
} from "lucide-react";
import { createGallery, deleteGallery } from "../../lib/api/gallery";

interface GalleryManagerProps {
  galleries: string[];
  onGalleriesChange: () => void;
}

export function GalleryManager({
  galleries,
  onGalleriesChange,
}: GalleryManagerProps) {
  const [newGallery, setNewGallery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGallery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      await createGallery(newGallery.trim());
      setNewGallery("");
      onGalleriesChange();
    } catch (err) {
      setError("Failed to create tag");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGallery = async (galleryName: string) => {
    if (!confirm(`Are you sure you want to delete the tag "${galleryName}"?`))
      return;

    setIsLoading(true);
    setError(null);

    try {
      await deleteGallery(galleryName);
      onGalleriesChange();
    } catch (err) {
      setError("Failed to delete tag");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <GalleryHorizontalIcon className="w-5 h-5" />
        Manage Galleries
      </h2>

      {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}

      <form onSubmit={handleCreateGallery} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newGallery}
          onChange={(e) => setNewGallery(e.target.value)}
          placeholder="Enter new gallery name..."
          className="flex-1 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={isLoading || !newGallery.trim()}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Add Tag
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {galleries.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-2 bg-gray-800 text-white px-3 py-1.5 rounded-lg text-sm group"
          >
            {tag}
            <button
              onClick={() => handleDeleteGallery(tag)}
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
