export class SupabaseError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'SupabaseError';
  }
}

export function handleSupabaseError(error: unknown): SupabaseError {
  if (error instanceof Error) {
    return new SupabaseError(error.message, error);
  }
  return new SupabaseError('An unexpected error occurred');
}