import type { WishlistItem, QuoteRequest } from "../../types";

export type ViewMode = "grid" | "list";

export interface WishlistGridProps {
  items: WishlistItem[];
  onReorder: (items: WishlistItem[]) => void;
  onRemove: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onQuoteSubmit: (data: QuoteRequest) => void;
}

export interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}
