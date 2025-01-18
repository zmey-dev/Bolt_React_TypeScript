export class QuoteError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'QuoteError';
  }
}

export function handleQuoteError(error: unknown): QuoteError {
  if (error instanceof Error) {
    return new QuoteError(error.message, error);
  }
  return new QuoteError('An unexpected error occurred');
}