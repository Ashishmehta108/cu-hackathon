/**
 * Environment configuration
 * All environment variables must be prefixed with VITE_ to be exposed to the client
 */

export const config = {
  // Backend API
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',

  // Supabase (anon key — safe to expose in browser)
  supabase: {
    url: "https://vcwaeqdbzlbqneekcctk.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjd2FlcWRiemxicW5lZWtjY3RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1OTczNDgsImV4cCI6MjA4NzE3MzM0OH0.7S6o1rR3sOmSjS4bFcpSFK_uJmjdBsgQGhFz8XnTgQk",
  },

  // Google Maps
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',

  // Environment
  env: import.meta.env.VITE_ENV || import.meta.env.MODE || 'development',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,

  // Sarvam AI (optional - usually handled by backend)
  sarvam: {
    apiKey: import.meta.env.VITE_SARVAM_API_KEY || '',
    baseUrl: import.meta.env.VITE_SARVAM_BASE_URL || 'https://api.sarvam.ai',
  },
} as const;

// Validate required environment variables in production
if (config.isProduction) {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_BACKEND_URL',
  ];

  const missingVars = requiredVars.filter(
    (varName) => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
}
