export interface Image {
  id: string;
  title: string;
  description: string;
  url: string;
  width: number;
  height: number;
  tags?: string[];
  gallery_type?: string;
  gallery_type_id?: string;
  image_tags?: {
    tag: {
      name: string;
    };
  }[];
}

export interface GalleryImage extends Image {
  display_order: number;
  custom_upload?: boolean;
  gallery_types?: {
    id: string;
    name: string;
  };
}

export interface WishlistItem extends Image {
  notes?: string;
  isCustomUpload?: boolean;
}

export interface QuoteRequestImage {
  image_id: string;
  notes: string;
  isCustomUpload?: boolean;
  url?: string;
}

export interface QuoteRequest {
  name: string;
  email: string;
  phone: string;
  timeline: string;
  budget: string;
  notes?: string;
  selectedImages: QuoteRequestImage[];
}

export interface QuoteRequestWithImages extends QuoteRequest {
  id: string;
  status: string;
  created_at: string;
  images: WishlistItem[];
}

export interface AccessCode {
  id: string;
  code: string;
  description?: string;
  expires_at?: string;
  created_at: string;
  created_by?: string;
  is_active: boolean;
  uses_remaining?: number;
  last_used_at?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}