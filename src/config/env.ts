/**
 * Environment configuration for the application
 * These values should be set in the .env file
 */
export const config = {
  // AI Service Configuration
  aiService: {
    url: import.meta.env.AI_SERVICE_URL || 'https://api.openrouter.ai/api/v1/chat',
    apiKey: import.meta.env.AI_SERVICE_API_KEY || '',
  },
  
  // Supabase Configuration
  supabase: {
    url: import.meta.env.PUBLIC_SUPABASE_URL || '',
    anonKey: import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '',
  },
  
  // API Configuration
  api: {
    maxTextLength: 10000,
  },
} as const;

// Type for the config object
export type Config = typeof config; 