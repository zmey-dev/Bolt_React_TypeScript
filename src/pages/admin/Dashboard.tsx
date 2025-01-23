import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Upload,
  Loader2,
  AlertCircle,
  Plus,
  Tag as TagIcon,
  Trash2,
  Check,
  X,
  Building2,
  Sparkles,
  Eye, // Added Eye icon
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
import { FileUploadZone } from "../../components/admin/FileUploadZone";
import {
  assign_tags_to_images,
  deleteImages,
  remove_tags_from_images,
} from "../../lib/api/images";
import { GalleryItem } from "../../components/GalleryItem";

export default function Dashboard() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [galleries, setGalleries] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedGallery, setSelectedGallery] = useState<{
    id: string;
    name: string;
  } | null>(null);
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
  const [selectedUploadTags, setSelectedUploadTags] = useState<string[]>([]);
  const [isAssigningTags, setIsAssigningTags] = useState(false);
  const [isRemovingTags, setIsRemovingTags] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageModalContent, setMessageModalContent] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [selectedImageForModal, setSelectedImageForModal] = useState<GalleryImage | null>(null); // Added state for image preview modal
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTagDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      // Auto-select first gallery if none is selected
      if (!selectedGallery && typesData.length > 0) {
        setSelectedGallery(typesData[0]);
      }
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
      await loadData();
    } catch (err) {
      console.error("Error deleting tag:", err);
      setError("Failed to delete tag");
    }
  };

  const handleUpload = async (eventOrFiles: React.ChangeEvent<HTMLInputElement> | FileList) => {
    console.log('Upload initiated:', {
      fileCount: event.target.files?.length || 0,
      selectedGallery: selectedGallery?.name
    });

    const files = eventOrFiles instanceof FileList ? eventOrFiles : eventOrFiles.target.files;
    
    if (!files || !selectedGallery) {
      console.error('Upload failed:', {
        hasFiles: !!files,
        hasGallery: !!selectedGallery
      });
      return;
    }

    try {
      setUploading(true);
      console.log('Starting upload to gallery:', selectedGallery.name);
      
      await uploadMultipleImages(files, selectedGallery.id, selectedUploadTags);
      console.log('Upload completed successfully');
      
      console.log('Reloading gallery data');
      await loadData();
    } catch (err) {
      console.error('Upload failed:', err);
      setError("Failed to upload images");
    } finally {
      setUploading(false);
      console.log('Upload process finished');
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

  const onAssignTags = async (
    image_ids: Array<string>,
    tag_ids: Array<string>
  ) => {
    try {
      setIsAssigningTags(true);
      await assign_tags_to_images(image_ids, tag_ids);
      await loadData();

      setMessageModalContent({
        text: "Tags assigned successfully!",
        type: "success",
      });
      setIsMessageModalOpen(true);

      setTimeout(() => {
        setIsShowAssignModal(false);
      }, 2000);
    } catch (error) {
      console.error("Error assigning tags:", error);
      setMessageModalContent({
        text: "Failed to assign tags. Please try again.",
        type: "error",
      });
      setIsMessageModalOpen(true);
    } finally {
      setIsAssigningTags(false);
    }
  };

  const onRemoveTags = async (
    image_ids: Array<string>,
    tag_ids: Array<string>
  ) => {
    try {
      setIsRemovingTags(true);
      await remove_tags_from_images(image_ids, tag_ids);
      await loadData();

      setMessageModalContent({
        text: "Tags removed successfully!",
        type: "success",
      });
      setIsMessageModalOpen(true);

      setTimeout(() => {
        setIsShowAssignModal(false);
      }, 2000);
    } catch (error) {
      console.error("Error removing tags:", error);
      setMessageModalContent({
        text: "Failed to remove tags. Please try again.",
        type: "error",
      });
      setIsMessageModalOpen(true);
    } finally {
      setIsRemovingTags(false);
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
    <div className="min-h-screen bg-[url('https://jpvvgmvvdfsiruthfkhb.supabase.co/storage/v1/object/public/images/Website%20Design%20Images/LightShowVault%20Darker%20Background.svg?t=2025-01-21T15%3A48%3A42.034Z')] bg-cover bg-center bg-no-repeat">
      {/* Message Modal */}
      <MessageModal
        isOpen={isMessageModalOpen}
        message={messageModalContent}
        onClose={() => {
          setIsMessageModalOpen(false);
          setIsShowAssignModal(false);
        }}
      />

      {/* Create Gallery Modal */}
      <Modal
        onClose={() => setIsCreatingGallery(false)}
        isOpen={isCreatingGallery}
        title={
          <div className="flex items-center gap-2 text-yellow-400">
            <Building2 className="w-5 h-5" />
            <span>Create New Gallery</span>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Gallery Name
            </label>
            <input
              type="text"
              value={newGalleryName}
              onChange={(e) => setNewGalleryName(e.target.value)}
              placeholder="Enter gallery name"
              className="w-full bg-[#1f1f1f] text-white border-2 border-yellow-400/20 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-colors"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              className="px-4 py-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white rounded-lg transition-colors border border-yellow-400/20"
              onClick={() => {
                setNewGalleryName("");
                setIsCreatingGallery(false);
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-[#260000] rounded-lg transition-colors font-medium"
              onClick={handleCreateGallery}
            >
              Create Gallery
            </button>
          </div>
        </div>
      </Modal>

      {/* Assign Tags Modal */}
      <Modal
        isOpen={isShowAssignModal}
        onClose={() => setIsShowAssignModal(false)}
        title={
          <div className="flex items-center gap-2 text-yellow-400">
            <TagIcon className="w-5 h-5" />
            <span>Assign Tags To Images</span>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <h3 className="text-white font-medium mb-2">Available Tags:</h3>
          <div className="flex flex-wrap gap-2">
            {tagData.map((tag) => (
              <button
                key={tag.id}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                  selectedTagIds.includes(tag.id)
                    ? `${getTagColor(
                        tag.name
                      )} ring-2 ring-yellow-400 ring-opacity-80`
                    : `${getTagColor(tag.name)} opacity-70 hover:opacity-100`
                }`}
                onClick={() => {
                  if (selectedTagIds.includes(tag.id)) {
                    setSelectedTagIds((prev) =>
                      prev.filter((id) => id !== tag.id)
                    );
                  } else {
                    setSelectedTagIds((prev) => [...prev, tag.id]);
                  }
                }}
              >
                {tag.name}
                {selectedTagIds.includes(tag.id) && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <button
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-[#260000] px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
              onClick={async () => {
                await onAssignTags(Array.from(selectedImages), selectedTagIds);
              }}
              disabled={isAssigningTags}
            >
              {isAssigningTags ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
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
              onClick={async () => {
                await onRemoveTags(Array.from(selectedImages), selectedTagIds);
              }}
              disabled={isRemovingTags}
            >
              {isRemovingTags ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <X className="w-4 h-4" />
                  Remove Tags
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        isOpen={!!selectedImageForModal}
        onClose={() => setSelectedImageForModal(null)}
        title="Image Preview"
      >
        <div className="flex justify-center">
          {selectedImageForModal && (
            <img
              src={selectedImageForModal.url}
              alt="Preview"
              className="max-w-full max-h-[80vh] rounded-lg"
            />
          )}
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setSelectedImageForModal(null)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </Modal>

      <AdminNav />
      <div className="max-w-[1400px] mx-auto p-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0 bg-[#260000]/90 backdrop-blur-sm p-4 rounded-lg border border-yellow-400/20 h-fit">
            <button
              onClick={() => setIsCreatingGallery(true)}
              className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-[#260000] px-4 py-3 rounded-lg mb-6 font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-yellow-400/25 border border-yellow-400"
            >
              <Plus className="w-4 h-4" />
              Create New Gallery
            </button>

            <h3 className="text-yellow-400 text-sm font-medium mb-2">
              Galleries
            </h3>
            <div className="space-y-1">
              {galleries.map((gallery) => (
                <GalleryItem
                  key={gallery.id}
                  gallery={gallery}
                  isSelected={selectedGallery?.id === gallery.id}
                  setSelectedGallery={setSelectedGallery}
                />
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {selectedGallery && (
              <div className="bg-[#260000]/90 backdrop-blur-sm p-6 rounded-lg border border-yellow-400/20">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                    {selectedGallery.name}
                  </h1>
                </div>

                {/* Quick Add Tags */}
                <div className="bg-[#1f1f1f] rounded-lg p-6 mb-6 border border-yellow-400/20">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <TagIcon className="w-5 h-5 text-yellow-400" />
                    Quick Add Tags
                  </h3>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Enter new tag name"
                      className="flex-1 bg-[#1f1f1f] text-white border-2 border-yellow-400/20 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-colors"
                    />
                    <button
                      onClick={handleAddTag}
                      className="bg-yellow-400 hover:bg-yellow-500 text-[#260000] px-4 py-2 rounded-lg transition-colors font-medium"
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
                      >
                        {tag.name}
                        <button
                          onClick={() => handleDeleteTag(tag)}
                          className="hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* File Upload Zone */}
                <div className="mb-6">
                  <FileUploadZone
                    onUpload={handleUpload}
                    isUploading={uploading}
                    availableTags={tagData}
                    selectedTags={selectedUploadTags}
                    onTagsChange={setSelectedUploadTags}
                  />
                </div>

                {/* Image Selection Controls */}
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 text-gray-300 hover:text-yellow-400 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    {selectedImages.size === images.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>

                  {selectedImages.size > 0 && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedTagIds([]);
                          setIsShowAssignModal(true);
                        }}
                        className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-[#260000] px-4 py-2 rounded-lg transition-colors font-medium"
                      >
                        <TagIcon className="w-4 h-4" />
                        Change Tags ({selectedImages.size})
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Images ({selectedImages.size})
                      </button>
                    </>
                  )}
                </div>

                {/* Image Grid */}
                <div className="h-[800px] overflow-y-auto pr-2 rounded-lg custom-scrollbar -mt-10">
                  {/* Tag Filter Dropdown */}
                  <div className="flex justify-end mb-6">
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setShowTagDropdown(!showTagDropdown)}
                        className="flex items-center gap-2 bg-[#1f1f1f] text-white border-2 border-yellow-400/20 rounded-lg px-4 py-2 hover:border-yellow-400/50 transition-colors"
                      >
                        <TagIcon className="w-4 h-4 text-yellow-400" />
                        {selectedFilterTags.length === 0 ? (
                          "Filter by Tags"
                        ) : (
                          `${selectedFilterTags.length} Tags Selected`
                        )}
                      </button>
                      {showTagDropdown && (
  <div className="absolute right-0 top-full mt-2 -translate-y-1 w-48 bg-[#1f1f1f] border-2 border-yellow-400/20 rounded-lg shadow-lg p-4 z-50 max-h-[300px] overflow-y-auto custom-scrollbar">
    {tagData.length === 0 ? (
      <p className="text-gray-400 text-sm text-center py-2">No tags available</p>
    ) : (
      <div className="space-y-2">
        {tagData.map((tag) => (
          <button
            key={tag.id}
            onClick={() => {
              if (selectedFilterTags.includes(tag.id)) {
                setSelectedFilterTags(prev => prev.filter(id => id !== tag.id));
              } else {
                setSelectedFilterTags(prev => [...prev, tag.id]);
              }
            }}
            className={`flex items-center justify-between px-3 py-1.5 rounded-lg transition-all ${
              selectedFilterTags.includes(tag.id)
                ? getTagColor(tag.name)
                : `${getTagColor(tag.name)} opacity-60 hover:opacity-100`
            }`}
            style={{ width: 'fit-content' }} // Ensures the tag only takes up as much space as needed
          >
            <span>{tag.name}</span>
            {selectedFilterTags.includes(tag.id) && (
              <Check className="w-4 h-4" />
            )}
          </button>
        ))}
      </div>
    )}
    {selectedFilterTags.length > 0 && (
      <button
        onClick={() => setSelectedFilterTags([])}
        className="w-full mt-4 flex items-center justify-center gap-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white px-3 py-2 rounded-lg text-sm transition-colors"
      >
        <X className="w-4 h-4" />
        Clear All Filters
      </button>
    )}
  </div>
)}
                    </div>
                  </div>
                  <div className="grid grid-cols-6 gap-4">
                  {images.filter((img) => {
                      // First filter by gallery type
                      const matchesGallery = img.gallery_type_id === selectedGallery.id;
                      
                      // Then filter by selected tags if any are selected
                      const matchesTags = selectedFilterTags.length === 0 || 
                        selectedFilterTags.some(tagId => 
                          img.tags?.some(tag => tag.id === tagId)
                        );
                      
                      return matchesGallery && matchesTags;
                    })
                    .map((image) => (
                      <div
                        key={image.id}
                        className={`relative group rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                          selectedImages.has(image.id)
                            ? "border-yellow-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                            : "border-transparent hover:border-yellow-400/50"
                        }`}
                      >
                        <img
                          src={image.url}
                          alt=""
                          className="w-full aspect-square object-cover"
                        />
                        <div
                          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
                            selectedImages.has(image.id)
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-100"
                          }`}
                        >
                          <div className="absolute top-2 left-2 flex gap-2">
                            <button
                              onClick={() => handleImageSelect(image.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                selectedImages.has(image.id)
                                  ? "bg-yellow-400 text-[#260000]"
                                  : "bg-[#1f1f1f] text-white border border-yellow-400/50"
                              }`}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="absolute top-2 right-2">
                            {/* Eye Icon */}
                            <button
                              onClick={() => setSelectedImageForModal(image)}
                              className="p-2 rounded-lg bg-[#1f1f1f] text-white border border-yellow-400/50 hover:bg-yellow-400 hover:text-[#260000] transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {image.tags && image.tags.length > 0 && (
                          <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1 z-10 max-h-[80px] overflow-y-auto scrollbar-none bg-black/50 p-1.5 rounded-lg">
                            {image.tags.map((tag) => {
                              const tagObject = tagData.find(
                                (t) => t.id === tag.id
                              );
                              return (
                                <span
                                  key={tag.id}
                                  className={`inline-flex items-center gap-2 px-1 py-0.5 rounded-lg text-xs text-white ${
                                    tagObject
                                      ? getTagColor(tagObject.name)
                                      : "bg-yellow-400"
                                  }`}
                                >
                                  {tag.name}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Message Modal Component
function MessageModal({ isOpen, message, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/75 backdrop-blur-sm z-50">
      <div className="bg-[#260000] p-6 rounded-lg shadow-lg max-w-sm w-full border border-yellow-400/20">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          {message.type === "success" ? (
            <Check className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          {message.type === "success" ? "Success!" : "Error!"}
        </h2>
        <p className="text-gray-300">{message.text}</p>
        <button
          onClick={onClose}
          className={`mt-4 w-full ${
            message.type === "success"
              ? "bg-green-600 hover:bg-green-700"
              : "bg-red-600 hover:bg-red-700"
          } text-white px-4 py-2 rounded-lg transition-colors`}
        >
          Close
        </button>
      </div>
    </div>
  );
}