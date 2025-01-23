import { getSupabaseClient } from '../supabase';
import { SupabaseError } from '../supabase/error';

// Proxy URL for CORS bypass
const CORS_PROXY = 'https://corsproxy.io/?';

const STORAGE_CONFIG = {
  mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxSize: 52428800, // 50MB
  retries: 5,
  initialDelay: 1000,
  maxDelay: 10000,
  bucket: 'images',
  folder: 'generated'
};

// CORS proxy URLs to try in order
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/'
];

interface StorageError extends Error {
  code?: string;
  statusCode?: number;
  details?: string;
}

async function fetchImage(imageUrl: string, retryCount = 0): Promise<Blob> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    // Try direct fetch first
    try {
      const response = await fetch(imageUrl, {
        mode: 'cors',
        credentials: 'omit',
        signal: controller.signal
      });
      if (response.ok) {
        return await response.blob();
      }
    } catch (err) {
      console.warn('Direct fetch failed, trying proxies...');
    }

    // Try each proxy in order
    for (const proxy of CORS_PROXIES) {
      try {
        const response = await fetch(`${proxy}${encodeURIComponent(imageUrl)}`, {
          mode: 'cors',
          credentials: 'omit',
          signal: controller.signal
        });
        if (response.ok) {
          return await response.blob();
        }
      } catch (err) {
        console.warn(`Proxy ${proxy} failed:`, err);
        continue;
      }
    }

    // If all proxies fail and we haven't exceeded retries
    if (retryCount < STORAGE_CONFIG.retries) {
      const delay = Math.min(
        STORAGE_CONFIG.initialDelay * Math.pow(2, retryCount),
        STORAGE_CONFIG.maxDelay
      );
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchImage(imageUrl, retryCount + 1);
    }

    throw new Error('Failed to fetch image after all retries');
  } catch (err) {
    const error = new Error('Failed to process image') as StorageError;
    error.code = 'IMAGE_PROCESSING_ERROR';
    error.cause = err;
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function storeGeneratedImage(imageUrl: string): Promise<string> {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) {
      const error = new Error('Storage service unavailable') as StorageError;
      error.code = 'SERVICE_UNAVAILABLE';
      throw error;
    }

    // Fetch image directly
    const blob = await fetchImage(imageUrl);

    // Validate blob
    if (blob.size === 0 || blob.size > STORAGE_CONFIG.maxSize) {
      const error = new Error(
        blob.size === 0 ? 'Empty image file' : 'Image file too large'
      ) as StorageError;
      error.code = 'INVALID_SIZE';
      error.details = `Size: ${blob.size} bytes, Max: ${STORAGE_CONFIG.maxSize} bytes`;
      throw error;
    }

    // Generate unique filename
    const timestamp = new Date().getTime();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExt = blob.type.split('/')[1] || 'png';
    const fileName = `${STORAGE_CONFIG.folder}/${timestamp}-${randomId}.${fileExt}`;

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_CONFIG.bucket)
      .upload(fileName, blob, {
        contentType: blob.type,
        cacheControl: '3600',
        upsert: false // Prevent overwriting existing files
      });

    if (uploadError) {
      const error = new Error('Failed to upload image') as StorageError;
      error.code = uploadError.message.includes('Permission') ? 'PERMISSION_DENIED' : 'UPLOAD_ERROR';
      error.details = uploadError.message;
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage 
      .from(STORAGE_CONFIG.bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (err) {
    // Log detailed error information
    console.error('Storage error:', {
      code: (err as StorageError).code,
      message: err instanceof Error ? err.message : 'Unknown error',
      details: (err as StorageError).details,
      statusCode: (err as StorageError).statusCode
    });

    // Throw a user-friendly error
    if (err instanceof Error) {
      throw new SupabaseError(err.message, err);
    }
    throw new SupabaseError('Failed to store generated image');
  }
}