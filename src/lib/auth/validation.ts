import { AUTH_ERRORS } from './errors';
import type { AuthError } from './types';

export function validateCredentials(email: string, password: string): AuthError | null {
  if (!email || !password) {
    return { message: AUTH_ERRORS.INVALID_CREDENTIALS };
  }
  return null;
}