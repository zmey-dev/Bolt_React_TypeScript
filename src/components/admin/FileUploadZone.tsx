import React, { useState, useRef } from 'react';
import { Upload, Loader2, Image as ImageIcon, X, Tag as TagIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTagColor } from '../../lib/utils/colors';

interface FileUploadZoneProps {
  onUpload: (files: FileList) => Promise<void>;
  isUploading: boolean;
  availableTags: Array<{ id: string; name: string }>;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function FileUploadZone({ 
  onUpload, 
  isUploading, 
  availableTags,
  selectedTags,
  onTagsChange
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    // Validate files
    const invalidFiles = Array.from(files).filter(
      file => !file.type.startsWith('image/')
    );

    if (invalidFiles.length > 0) {
      setError('Please upload only image files');
      return;
    }

    try {
      await onUpload(files);
    } catch (err) {
      setError('Failed to upload images. Please try again.');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setError(null);
      await onUpload(files);
      e.target.value = ''; // Reset input
    } catch (err) {
      setError('Failed to upload images. Please try again.');
    }
  };

  return (
    <div className="relative">
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 transition-colors text-center
          flex flex-col gap-6
          ${isDragging
            ? "border-yellow-400 bg-yellow-400/10"
            : "border-yellow-400/20 hover:border-yellow-400/50"
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Tag Selection */}
        <div className="text-left">
          <div className="flex items-center gap-2 mb-4">
            <TagIcon className="w-5 h-5 text-yellow-400" />
            <h3 className="text-white font-medium">Select Tags for Uploaded Images</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                onClick={(e) => {
                  e.preventDefault();
                  if (selectedTags.includes(tag.id)) {
                    onTagsChange(selectedTags.filter(id => id !== tag.id));
                  } else {
                    onTagsChange([...selectedTags, tag.id]);
                  }
                }}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                  selectedTags.includes(tag.id)
                    ? `${getTagColor(tag.name)} ring-2 ring-yellow-400 ring-opacity-80`
                    : `${getTagColor(tag.name)} opacity-70 hover:opacity-100`
                }`}
              >
                {tag.name}
                {selectedTags.includes(tag.id) && (
                  <X className="w-3 h-3" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer"
        >
        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
              <p className="text-gray-300">Uploading images...</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 cursor-pointer"
            >
              {isDragging ? (
                <Upload className="w-8 h-8 text-yellow-400" />
              ) : (
                <ImageIcon className="w-8 h-8 text-yellow-400" />
              )}
              <div>
                <p className="text-gray-300 font-medium mb-1">
                  {isDragging ? "Drop images here" : "Upload images"}
                </p>
                <p className="text-sm text-gray-400">
                  Drag and drop or click to select
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 bg-red-900/30 border border-red-500 rounded-lg text-red-200 text-sm flex items-center gap-2"
          >
            <X className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </div>
    </div>
  );
}