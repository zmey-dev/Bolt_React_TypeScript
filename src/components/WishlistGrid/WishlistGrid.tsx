import React, { useState } from "react";
import { Link } from "react-router-dom";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Heart, ArrowLeft, Upload, Wand2, FileText } from "lucide-react";
import { WishlistItemCard } from "./components/WishlistItemCard";
import { Modal } from "../Modal";
import { QuoteForm } from "../QuoteForm";
import { WishlistUploader } from "../WishlistUploader";
import { DesignGeneratorModal } from "../DesignGeneratorModal";
import { Header } from "./components/Header";
import { EmptyState } from "./components/EmptyState";

export function WishlistGrid({
  items,
  onReorder,
  onRemove,
  onUpdateNotes,
  onQuoteSubmit,
}: WishlistGridProps) {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  const handleDragEnd = React.useCallback(
    ({ active, over }) => {
      if (over && active.id !== over.id) {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        onReorder(arrayMove(items, oldIndex, newIndex));
      }
    },
    [items, onReorder]
  );

  const handleRemove = React.useCallback(
    (id: string) => {
      onRemove(id);
    },
    [onRemove]
  );

  const handleUpload = React.useCallback(
    (image) => {
      onReorder([...items, image]);
      setIsUploadModalOpen(false);
    },
    [items, onReorder]
  );

  return (
    <div className="container mx-auto max-w-[1400px] px-4 py-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 text-yellow-400 mb-4">
          <Heart className="w-6 h-6 text-yellow-400" />
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">My Wishlist</h1>
        </div>
        
        {/* Wrap the text in a container with max-width and center it */}
        <div className="max-w-2xl mx-auto px-4 mb-6">
          <p className="text-gray-300 mb-4 leading-relaxed text-sm md:text-base">
            Add notes for each lighting design in your wishlist, including sizes, colors, customizations, or special requests, to help us provide an accurate quote. You can also upload your own design or use the 'Generate New Design' button for AI-generated custom options.
          </p>
        </div>
        
        <p className="text-yellow-400 mb-8">
          {items.length} {items.length === 1 ? 'item' : 'items'} in wishlist
        </p>
        
        {/* Mobile-optimized button grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:justify-center items-center gap-3 lg:gap-4">
          {/* Back to Gallery Button */}
          <Link 
            to="/"
            className="flex items-center justify-center gap-2 bg-[#260000] hover:bg-[#3b0000] text-white border border-yellow-400 px-4 py-2.5 lg:px-5 lg:py-3 rounded-lg transition-colors text-sm lg:text-base w-full lg:w-auto"
          >
            <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="whitespace-nowrap">Back to Gallery</span>
          </Link>

          {/* Upload Your Own Design Button */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-[#260000] hover:bg-[#3b0000] text-white border border-yellow-400 px-4 py-2.5 lg:px-5 lg:py-3 rounded-lg transition-colors text-sm lg:text-base w-full lg:w-auto"
          >
            <Upload className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="whitespace-nowrap">Upload Your Own Design</span>
          </button>

          {/* Generate New Design Button */}
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-[#260000] hover:bg-[#3b0000] text-white border border-yellow-400 px-4 py-2.5 lg:px-5 lg:py-3 rounded-lg transition-colors text-sm lg:text-base w-full lg:w-auto"
          >
            <Wand2 className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="whitespace-nowrap">Generate New Design</span>
          </button>

          {/* Request a Quote Button */}
          <button
            onClick={() => setIsQuoteModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-[#260000] border border-yellow-400 px-4 py-2.5 lg:px-5 lg:py-3 rounded-lg transition-colors text-sm lg:text-base font-medium w-full lg:w-auto"
          >
            <FileText className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="whitespace-nowrap">Request a Quote</span>
          </button>
        </div>
      </div>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, index) => (
              <WishlistItemCard
                key={index}
                item={item}
                onRemove={handleRemove}
                onUpdateNotes={onUpdateNotes}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Modal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        title={
          <div className="flex items-center justify-center gap-2 text-yellow-400 text-lg">
            <Heart className="w-6 h-6 text-yellow-400" />
            <span className="text-lg font-semibold">Wishlist Quote Request</span>
          </div>
        }
      >
        <QuoteForm
          selectedImages={items.map((item) => ({
            image_id: item.id,
            notes: item.notes || "",
            isCustomUpload: item.isCustomUpload,
            url: item.isCustomUpload ? item.url : undefined,
          }))}
          onSubmit={onQuoteSubmit}
        />
      </Modal>

      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Your Design"
      >
        <div className="p-4">
          <WishlistUploader onUpload={handleUpload} />
        </div>
      </Modal>

      <DesignGeneratorModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onAddToWishlist={(imageUrl, action) => {
          if (action === 'add') {
            onReorder([
              ...items,
              {
                id: crypto.randomUUID(),
                url: imageUrl,
                title: "Generated Design",
                description: "AI-generated LED design",
                width: 1024,
                height: 1024,
                isCustomUpload: true,
              },
            ]);
          } else {
            onReorder(items.filter(item => item.url !== imageUrl));
          }
        }}
      />
    </div>
  );
}