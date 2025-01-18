import { ERRORS } from './constants';

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

class ConfigManager {
  private config: SupabaseConfig | null = null;

  initialize(): SupabaseConfig {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      console.warn('Missing Supabase configuration');
      throw new Error(ERRORS.CONFIG);
    }

    this.config = { url, anonKey };
    return this.config;
  }

  getConfig(): SupabaseConfig {
    if (!this.config) {
      return this.initialize();
    }
    return this.config;
  }
}

export const configManager = new ConfigManager();