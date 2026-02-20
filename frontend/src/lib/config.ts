/**
 * Environment configuration
 * All environment variables must be prefixed with VITE_ to be exposed to the client
 */

export const config = {
  // Backend API
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',

  // Firebase Configuration
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
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
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_PROJECT_ID',
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
