// Environment variable validation and access
export const ENV = {
  get SUPABASE_URL() {
    const url = import.meta.env.VITE_SUPABASE_URL;
    if (!url) {
      console.error('Missing VITE_SUPABASE_URL environment variable');
    }
    return url;
  },
  get SUPABASE_ANON_KEY() {
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!key) {
      console.error('Missing VITE_SUPABASE_ANON_KEY environment variable');
    }
    return key;
  }
} as const;

// Validate environment variables are present
export function validateEnv() {
  const missing = Object.entries(ENV).filter(([_, value]) => !value);
  
  if (missing.length > 0) {
    const vars = missing.map(([key]) => key).join(', ');
    throw new Error(`Missing environment variables: ${vars}. Please click "Connect to Supabase" to set up your connection.`);
  }
}