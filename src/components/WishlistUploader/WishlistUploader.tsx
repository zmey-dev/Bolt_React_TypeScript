import React, { useState, useRef } from "react";
import { Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadWishlistImage } from "../../lib/api/upload/wishlist";
import type { WishlistItem } from "../../types";

interface WishlistUploaderProps {
  onUpload: (image: WishlistItem) => void;
}

export function WishlistUploader({ onUpload }: WishlistUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      const image = await uploadWishlistImage(file);
      onUpload(image);
    } catch (err) {
      setError("Failed to upload image. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await handleUpload(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleUpload(file);
    }
  };

  return (
    <div className="relative">
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 transition-colors text-center
          ${
            isDragging
              ? "border-purple-500 bg-purple-500/10"
              : "border-gray-700 hover:border-purple-500"
          }
        `}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              <p className="text-gray-400">Uploading image...</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 cursor-pointer"
            >
              {isDragging ? (
                <Upload className="w-8 h-8 text-purple-500" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-500" />
              )}
              <div>
                <p className="text-gray-300 font-medium mb-1">
                  {isDragging ? "Drop image here" : "Upload your own design"}
                </p>
                <p className="text-sm text-gray-400">
                  Drag and drop or click to select
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-sm mt-4"
          >
            {error}
          </motion.p>
        )}
      </div>
    </div>
  );
}
