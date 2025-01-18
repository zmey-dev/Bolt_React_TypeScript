export class UploadError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'UploadError';
  }
}

export function handleUploadError(error: unknown): UploadError {
  console.error('Upload error:', error);
  
  if (error instanceof Error) {
    return new UploadError(error.message, error);
  }
  
  return new UploadError('Failed to upload file');
}