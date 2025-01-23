export interface AccessCodeRequest {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  project_type: string;
  estimated_budget: string;
  timeline: string;
  additional_info?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  notes?: string;
}

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
  affiliate_id?: string;
  access_code_id?: string;
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
  created_by_id: string;
  expires_at?: string;
  created_at: string;
  created_by?: string;
  is_active: boolean;
  status: 'active' | 'inactive' | 'expired';
  uses_remaining?: number;
  last_used_at?: string;
}

export interface User {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'affiliate';
}

export interface AffiliateInvite {
  id: string;
  email: string;
  token: string;
  expires_at: string;
  created_at: string;
  created_by: string;
  status: 'pending' | 'accepted' | 'expired';
}