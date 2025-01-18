export interface AuthError {
  message: string;
  code?: string;
}

export interface AuthResponse {
  success: boolean;
  error?: AuthError;
}