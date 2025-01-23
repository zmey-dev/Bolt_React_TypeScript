export class SupabaseError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'SupabaseError';
  }
}

export function handleSupabaseError(error: unknown): SupabaseError {
  // Handle specific Supabase error codes
  if (error && typeof error === 'object' && 'code' in error) {
    switch (error.code) {
      case '23505': // Unique violation
        return new SupabaseError('A duplicate entry exists');
      case '42501': // Permission denied
        return new SupabaseError('Permission denied - please try again');
      case '23503': // Foreign key violation  
        return new SupabaseError('Referenced record does not exist');
      case '23514': // Check violation
        return new SupabaseError('Invalid data provided');
      case '23502': // Not null violation
        return new SupabaseError('Required data is missing');
      case '22P02': // Invalid text representation
        return new SupabaseError('Invalid data format');
      case '28000': // Invalid authorization
        return new SupabaseError('Authorization failed - please try again');
      case '2D000': // Invalid transaction
        return new SupabaseError('Operation failed - please try again');
      case '08006': // Connection failure
      case '08001': // Unable to connect
      case '08004': // Rejected connection
        return new SupabaseError('Connection failed - please try again');
    }
  }

  if (error instanceof Error) {
    return new SupabaseError(error.message, error);
  }
  return new SupabaseError('An unexpected error occurred');
}