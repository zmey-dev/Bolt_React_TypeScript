import React, { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { WishlistItemCard } from "./components/WishlistItemCard";
import { Modal } from "../Modal";
import { QuoteForm } from "../QuoteForm";
import { WishlistUploader } from "../WishlistUploader";
import { Header } from "./components/Header";
import { EmptyState } from "./components/EmptyState";
import type { WishlistGridProps } from "./types";

export function WishlistGrid({
  items,
  onReorder,
  onRemove,
  onUpdateNotes,
  onQuoteSubmit,
}: WishlistGridProps) {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

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
      // onAddGallery((prev) => [...prev, image]);
      setIsUploadModalOpen(false);
    },
    [items, onReorder]
  );

  // if (items.length === 0) {
  //   return (
  //     <div className="container mx-auto max-w-[1400px] px-4 py-8">
  //       <EmptyState
  //         onUpload={() => {
  //           setIsUploadModalOpen(true);
  //         }}
  //       />
  //     </div>
  //   );
  // }

  return (
    <div className="container mx-auto max-w-[1400px] px-4 py-8">
      <Header
        itemCount={items.length}
        onUploadClick={() => setIsUploadModalOpen(true)}
        onQuoteClick={() => setIsQuoteModalOpen(true)}
      />

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        title="Request a Quote"
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
    </div>
  );
}
