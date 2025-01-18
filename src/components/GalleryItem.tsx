import React, { useState } from "react";
import { Edit2, Trash2, Check, X } from "lucide-react";
import { updateGallery, deleteGallery } from "../lib/api/gallery";

interface GalleryItemProps {
  gallery: { id: string; name: string };
  isSelected: boolean;
  setSelectedGallery: (
    selectedGallery: { id: string; name: string } | null
  ) => void;
}

export function GalleryItem({
  gallery,
  isSelected,
  setSelectedGallery,
}: GalleryItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(gallery.name);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (newName === gallery.name) {
      setIsEditing(false);
      return;
    }

    try {
      setIsLoading(true);
      await updateGallery(gallery.id, newName);
    } catch (error) {
      console.error("Failed to update gallery:", error);
    } finally {
      setIsLoading(false);
      setIsEditing(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      !confirm(`Are you sure you want to delete the "${gallery.name}" gallery?`)
    ) {
      return;
    }

    try {
      setIsLoading(true);
      await deleteGallery(gallery.id);
      if (isSelected) {
        setSelectedGallery(null);
      }
    } catch (error) {
      console.error("Failed to delete gallery:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      key={gallery.id}
      onClick={() => !isEditing && setSelectedGallery(gallery)}
      className={`group w-full flex items-center text-left px-4 py-2 rounded-lg transition-colors ${
        isEditing
          ? "bg-gray-800"
          : isSelected
          ? "bg-purple-600 text-white"
          : "text-gray-300 hover:bg-gray-700"
      } ${isLoading ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}
    >
      {isEditing ? (
        <>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="w-16 flex-1 bg-transparent border border-gray-600 rounded px-2 py-1 text-white focus:outline-none focus:border-purple-500"
            autoFocus
          />
          {newName.trim() && newName != gallery.name && (
            <button
              onClick={handleUpdate}
              className="p-1 hover:bg-gray-700 rounded ml-2"
              disabled={!newName.trim() || newName === gallery.name}
            >
              <Check className="w-4 h-4 text-green-400" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(false);
              setNewName(gallery.name);
            }}
            className="p-1 hover:bg-gray-700 rounded ml-1"
          >
            <X className="w-4 h-4 text-red-400" />
          </button>
        </>
      ) : (
        <>
          <span className="flex-1">{gallery.name}</span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-1 hover:bg-gray-700 rounded"
            >
              <Edit2 className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 hover:bg-gray-700 rounded"
            >
              <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
