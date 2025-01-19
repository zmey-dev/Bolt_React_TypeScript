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
import { getTagColor } from "../../lib/utils/colors";
import type { GalleryImage } from "../../types";
import { Modal } from "../../components/Modal";
import { ImageTagsEditor } from "../../components/admin/ImageTagsEditor";
import { div } from "framer-motion/client";
import { assign_tags_to_images, deleteImages } from "../../lib/api/images";
import { GalleryItem } from "../../components/GalleryItem";

export default function Dashboard() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [galleries, setGalleries] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedGallery, setSelectedGallery] = useState<{ id: string; name: string } | null>(null);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [selectedTagIds, setSelectedTagIds] = useState<Array<string>>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTag, setNewTag] = useState("");
  const [isCreatingGallery, setIsCreatingGallery] = useState(false);
  const [isShowAssignModal, setIsShowAssignModal] = useState(false);
  const [newGalleryName, setNewGalleryName] = useState("");
  const [tagData, setTagData] = useState<Array<{ id: string; name: string }>>([]);
  const [isAssigningTags, setIsAssigningTags] = useState(false); // Loading state for tag assignment
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false); // Popup modal state
  const [messageModalContent, setMessageModalContent] = useState<{ text: string; type: "success" | "error" } | null>(null); // Popup modal content

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
        (async () => {
          let query = supabase.from("tags").select("id, name, gallery_type_id");

          if (selectedGallery?.id) {
            query = query.eq("gallery_type_id", selectedGallery.id);
          }

          const { data } = await query.order("name");
          return data || [];
        })(),
      ]);
      setImages(imagesData);
      setGalleries(typesData);
      setTagData(tagsData);
      setSelectedImages(new Set());
      setTags(tagsData.map((t) => t.name));
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [selectedGallery?.id]);

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

  const handleDeleteTag = async (tag: { id: string; name: string }) => {
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

  const handleSelectAll = () => {
    if (selectedImages.size === images.length) {
      setSelectedImages(new Set());
    } else {
      const allImageIds = images.map((image) => image.id);
      setSelectedImages(new Set(allImageIds));
    }
  };

  const onAssignTags = async (image_ids: Array<string>, tag_ids: Array<string>) => {
  try {
    setIsAssigningTags(true); // Start loading
    await assign_tags_to_images(image_ids, tag_ids);
    await loadData(); // Reload data to reflect the changes

    // Show success popup modal
    setMessageModalContent({ text: "Tags assigned successfully!", type: "success" });
    setIsMessageModalOpen(true);

    // Close the Assign Tags Modal after a short delay (e.g., 2 seconds)
    setTimeout(() => {
      setIsShowAssignModal(false); // Close the Assign Tags Modal
    }, 2000); // 2-second delay
  } catch (error) {
    console.error("Error assigning tags:", error);

    // Show error popup modal
    setMessageModalContent({ text: "Failed to assign tags. Please try again.", type: "error" });
    setIsMessageModalOpen(true);
  } finally {
    setIsAssigningTags(false); // Stop loading
  }
};

  const handleBulkDelete = async () => {
    if (!selectedImages.size) return;
    if (!confirm(`Delete ${selectedImages.size} selected images?`)) return;
    try {
      await deleteImages(Array.from(selectedImages));
      await loadData();
      setSelectedImages(new Set());
    } catch (err) {
      setError("Failed to delete images");
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1419]">
      {/* Message Modal */}
      <MessageModal
        isOpen={isMessageModalOpen}
        message={messageModalContent}
        onClose={() => {
          setIsMessageModalOpen(false);
          setIsShowAssignModal(false); // Close the assign tags modal after the message modal is closed
        }}
      />

      {/* Create Gallery Modal */}
      <Modal
        onClose={() => setIsCreatingGallery(false)}
        isOpen={isCreatingGallery}
        title="Create New Gallery"
      >
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
      </Modal>

      {/* Assign Tags Modal */}
      <Modal
        isOpen={isShowAssignModal}
        onClose={() => setIsShowAssignModal(false)}
        title="Assign Tags To Images"
      >
        <div className="flex flex-col gap-4">
          {/* Display all tags as clickable buttons */}
          <h3 className="text-white font-medium mb-2">Available Tags:</h3>
          <div className="flex flex-wrap gap-2">
            {tagData.map((tag) => (
              <button
                key={tag.id}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                  selectedTagIds.includes(tag.id)
                    ? `${getTagColor(tag.name)} ring-2 ring-white ring-opacity-80` // Selected tag style
                    : `${getTagColor(tag.name)} opacity-70 hover:opacity-100` // Unselected tag style
                }`}
                onClick={() => {
                  // Toggle tag selection
                  if (selectedTagIds.includes(tag.id)) {
                    setSelectedTagIds((prev) => prev.filter((id) => id !== tag.id));
                  } else {
                    setSelectedTagIds((prev) => [...prev, tag.id]);
                  }
                }}
              >
                {tag.name}
                {selectedTagIds.includes(tag.id) && (
                  <Check className="w-4 h-4 text-white" /> // Checkmark for selected tags
                )}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-4">
            <button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              onClick={async () => {
                await onAssignTags(Array.from(selectedImages), selectedTagIds);
              }}
              disabled={isAssigningTags} // Disable button while loading
            >
              {isAssigningTags ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> {/* Loading spinner */}
                  Assigning...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Assign Tags
                </>
              )}
            </button>
            <button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              onClick={() => {
                setIsShowAssignModal(false);
              }}
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      </Modal>

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

            <h3 className="text-gray-400 text-sm font-medium mb-2">Galleries</h3>
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
                  <h3 className="text-white font-medium mb-4">Quick Add Tags</h3>
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
                    {tagData.map((tag) => (
                      <span
                        key={tag.id}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${getTagColor(
                          tag.name
                        )}`}
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

                {/* Always show Select All / Deselect All buttons */}
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 text-gray-400 hover:text-white"
                  >
                    <Check className="w-4 h-4" />
                    {selectedImages.size === images.length ? "Deselect All" : "Select All"}
                  </button>

                  {/* Show Assign Tags and Delete Images buttons only when images are selected */}
                  {selectedImages.size > 0 && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedTagIds([]); // Reset selected tags
                          setIsShowAssignModal(true); // Open the modal
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
                    </>
                  )}
                </div>

                {/* Image Grid */}
                <div className="grid grid-cols-6 gap-4">
                  {images
                    .filter((img) => img.gallery_type_id === selectedGallery.id)
                    .map((image) => (
                      <div
                        key={image.id}
                        className={`relative group rounded-lg overflow-hidden ${
                          selectedImages.has(image.id) ? "ring-2 ring-purple-500" : ""
                        }`}
                      >
                        <img
                          src={image.url}
                          alt=""
                          className="w-full aspect-square object-cover"
                        />
                        {/* Overlay for the selection button */}
                        <div
                          className={`absolute inset-0 bg-black/50 transition-opacity ${
                            selectedImages.has(image.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                          }`}
                        >
                          <div className="absolute top-2 right-2">
                            <button
                              onClick={() => handleImageSelect(image.id)}
                              className={`p-1 rounded-lg ${
                                selectedImages.has(image.id)
                                  ? "bg-purple-600 text-white"
                                  : "bg-gray-800 text-gray-300 border border-gray-300"
                              }`}
                            >
                              {selectedImages.has(image.id) ? (
                                <Check className="w-4 h-4" /> // Show checkmark if selected
                              ) : (
                                <div className="w-4 h-4" /> // Show blank box if not selected
                              )}
                            </button>
                          </div>
                        </div>
                        {/* Display tags on the image (outside the overlay) */}
                        {image.tags && image.tags.length > 0 && (
                          <div className="absolute bottom-2 left-2 flex gap-1 z-10">
                            {image.tags.map((tag) => {
                              // Find the tag object from tagData to get the tag name
                              const tagObject = tagData.find((t) => t.name === tag);
                              return (
                                <span
                                  key={tag}
                                  className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg text-xs text-white ${
                                    tagObject ? getTagColor(tagObject.name) : "bg-blue-500"
                                  }`}
                                >
                                  {tag}
                                </span>
                              );
                            })}
                          </div>
                        )}
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

// Reusable MessageModal Component
const MessageModal = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-[#1A1F25] p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
        <h2 className="text-xl font-bold text-white mb-4">
          {message.type === "success" ? "Success!" : "Error!"}
        </h2>
        <p className="text-gray-300">{message.text}</p>
        <button
          onClick={onClose}
          className={`mt-4 ${
            message.type === "success" ? "bg-green-500" : "bg-red-500"
          } hover:${
            message.type === "success" ? "bg-green-600" : "bg-red-600"
          } text-white px-4 py-2 rounded-lg transition-colors`}
        >
          Close
        </button>
      </div>
    </div>
  );
};