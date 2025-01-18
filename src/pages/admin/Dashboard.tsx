import React, { useState, useEffect, useCallback } from "react";
import {
  Upload,
  Loader2,
  AlertCircle,
  Plus,
  Tag as TagIcon,
  MoreVertical,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { AdminNav } from "../../components/AdminNav";
import {
  loadGalleryImages,
  getGalleryTypes,
  createGallery,
} from "../../lib/api/gallery";
import { getTags, createTag, deleteTag } from "../../lib/api/tags";
import { getSupabaseClient } from "../../lib/supabase";
import { uploadMultipleImages } from "../../lib/api/upload";
import type { GalleryImage } from "../../types";
import { GalleryItem } from "../../components/GalleryItem";
import { SortableGalleryGrid } from "../../components/admin/SortableGalleryGrid";
import { deleteImages } from "../../lib/api/images";

export default function Dashboard() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [galleries, setGalleries] = useState<string[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTag, setNewTag] = useState("");
  const [isCreatingGallery, setIsCreatingGallery] = useState(false);
  const [newGalleryName, setNewGalleryName] = useState("");
  const [tagData, setTagData] = useState<Array<{ id: string; name: string }>>(
    []
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = await getSupabaseClient();
      if (!supabase) {
        throw new Error("Supabase client not initialized");
      }

      const [imagesData, typesData, tagsData] = await Promise.all([
        loadGalleryImages(),
        getGalleryTypes(),
        supabase
          .from("tags")
          .select("id, name, gallery_type_id")
          .order("name")
          .then(({ data }) => data || []),
      ]);

      setImages(imagesData);
      setGalleries(typesData);
      setTagData(tagsData);
      setTags(tagsData.map((t) => t.name));
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [selectedGallery]);

  useEffect(() => {
    loadData();
  }, [loadData]);
  const handleCreateGallery = async () => {
    if (!newGalleryName.trim()) return;
    try {
      setIsCreatingGallery(true);
      await createGallery(newGalleryName.trim());
      await loadData();
      setNewGalleryName("");
    } catch (err) {
      setError("Failed to create gallery");
    } finally {
      setIsCreatingGallery(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim() || !selectedGallery) return;
    try {
      setError(null);
      await createTag(newTag.trim(), selectedGallery.id);
      await loadData();
      setNewTag("");
    } catch (err) {
      console.error("Error creating tag:", err);
      setError("Failed to create tag");
    }
  };

  const handleDeleteTag = async (tag: string) => {
    if (!confirm(`Are you sure you want to delete the tag "${tag.name}"?`)) {
      return;
    }

    try {
      setError(null);
      await deleteTag(tag.id);
      await loadData(); // Reload data to update tag list
    } catch (err) {
      console.error("Error deleting tag:", err);
      setError("Failed to delete tag");
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !selectedGallery) return;

    try {
      setUploading(true);
      await uploadMultipleImages(event.target.files, selectedGallery.id);
      await loadData();
    } catch (err) {
      setError("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const handleImageSelect = (id: string) => {
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

  const handleBulkDelete = async () => {
    if (!selectedImages.size) return;
    if (!confirm(`Delete ${selectedImages.size} selected images?`)) return;
    try {
      // Implement bulk delete logic here

      await deleteImages(Array.from(selectedImages));
      await loadData();
      setSelectedImages(new Set());
    } catch (err) {
      setError("Failed to delete images");
    }
  };

  const filteredImages = images.filter(
    (img) => !selectedGallery || img.gallery_type_id === selectedGallery.id
  );

  return (
    <div className="min-h-screen bg-[#0F1419]">
      {isCreatingGallery && (
        <div className="fixed w-screen h-screen top-0 left-0 z-20 flex justify-center items-center bg-black/50">
          <div className="w-80 relative bg-gray-800 p-4 rounded-xl flex flex-col justify-center items-center">
            <X
              className="absolute cursor-pointer right-2 top-2"
              onClick={() => setIsCreatingGallery(false)}
            />
            <span className="w-full py-2 text-xl">Create New Gallery</span>
            {/* <hr className="w-full text-white" /> */}
            <span className="w-full ">Gallery Name</span>

            <input
              type="text"
              value={newGalleryName}
              onChange={(e) => setNewGalleryName(e.target.value)}
              placeholder="New gallery name"
              className="bg-gray-800 w-full my-2 py-2 focus:border-blue-500 text-white border border-gray-700 rounded-lg"
            />
            <div className="w-full flex">
              <button
                className="ml-auto bg-gray-700 px-4 py-2 rounded-lg"
                onClick={() => {
                  setNewGalleryName("");
                  setIsCreatingGallery(false);
                }}
              >
                Cancel
              </button>
              <button
                className="ml-2 bg-blue-500 px-4 py-2 rounded-lg"
                onClick={() => {
                  handleCreateGallery();
                }}
              >
                Create Gallery
              </button>
            </div>
          </div>
        </div>
      )}
      <AdminNav />
      <div className="max-w-[1400px] mx-auto p-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <button
              onClick={() => setIsCreatingGallery(true)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mb-6"
            >
              <Plus className="w-4 h-4" />
              Create New Gallery
            </button>

            <h3 className="text-gray-400 text-sm font-medium mb-2">
              Galleries
            </h3>
            <div className="space-y-1">
              {galleries.map((gallery) => (
                <GalleryItem
                  key={gallery.id}
                  gallery={gallery}
                  isSelected={selectedGallery?.id == gallery?.id}
                  setSelectedGallery={setSelectedGallery}
                />
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {selectedGallery && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-white">
                    {selectedGallery.name}
                  </h1>
                  <button
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Bulk Upload Images
                      </>
                    )}
                  </button>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleUpload}
                  />
                </div>

                {/* Quick Add Tags */}
                <div className="bg-[#1A1F25] rounded-lg p-4 mb-6">
                  <h3 className="text-white font-medium mb-4">
                    Quick Add Tags
                  </h3>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Enter new tag name"
                      className="flex-1 bg-[#2A303C] text-white border border-gray-700 rounded-lg px-3 py-2"
                    />
                    <button
                      onClick={handleAddTag}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                      Add Tag
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tagData
                      .filter(
                        (tag) => tag.gallery_type_id == selectedGallery.id
                      )
                      .map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#2A303C] text-gray-300"
                          title="Click X to delete tag"
                        >
                          {tag.name}
                          <button
                            onClick={() => handleDeleteTag(tag)}
                            className="text-gray-400 hover:text-red-400"
                            title="Delete tag"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                  </div>
                </div>

                {/* Image Actions */}
                {selectedImages.size > 0 && (
                  <div className="flex items-center gap-4 mb-4">
                    <button
                      onClick={() => setSelectedImages(new Set())}
                      className="flex items-center gap-2 text-gray-400 hover:text-white"
                    >
                      <Check className="w-4 h-4" />
                      Deselect All
                    </button>
                    <button
                      onClick={() => {
                        /* Implement assign tags */
                      }}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                      <TagIcon className="w-4 h-4" />
                      Assign Tags ({selectedImages.size})
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Images ({selectedImages.size})
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-4">
                  {filteredImages.map((image) => (
                    <div
                      key={image.id}
                      className={`relative group rounded-lg overflow-hidden ${
                        selectedImages.has(image.id)
                          ? "ring-2 ring-purple-500"
                          : ""
                      }`}
                    >
                      <img
                        src={image.url}
                        alt=""
                        className="w-full aspect-square object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute top-2 right-2">
                          <button
                            onClick={() => handleImageSelect(image.id)}
                            className={`p-1 rounded-lg ${
                              selectedImages.has(image.id)
                                ? "bg-purple-600 text-white"
                                : "bg-gray-800 text-gray-300"
                            }`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
