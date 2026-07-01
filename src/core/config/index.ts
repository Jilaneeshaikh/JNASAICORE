import { SystemConfig } from '../types';

// Helper to check if we are in node or browser
const isServer = typeof process !== 'undefined' && process.env !== undefined;

/**
 * Safely resolves an environment variable from process.env or import.meta.env
 */
function getEnvVar(key: string, defaultValue: string = ''): string {
  if (isServer) {
    return process.env[key] || defaultValue;
  }
  // Client side fallback (Vite format is VITE_*)
  try {
    const metaEnv = (import.meta as any).env;
    if (metaEnv) {
      return metaEnv[key] || metaEnv[`VITE_${key}`] || defaultValue;
    }
  } catch {
    // Ignore meta reference errors in non-supported transpilers
  }
  return defaultValue;
}

export const config: SystemConfig = {
  app: {
    name: 'JNAS AI Core',
    version: '0.1.1',
    environment: (getEnvVar('NODE_ENV', 'development') as 'development' | 'production' | 'test'),
    debug: getEnvVar('NODE_ENV') !== 'production',
  },
  env: {
    port: Number(getEnvVar('PORT', '3000')),
    host: getEnvVar('HOST', '0.0.0.0'),
    nodeEnv: getEnvVar('NODE_ENV', 'development'),
  },
  firebase: {
    apiKey: getEnvVar('FIREBASE_API_KEY'),
    authDomain: getEnvVar('FIREBASE_AUTH_DOMAIN'),
    projectId: getEnvVar('FIREBASE_PROJECT_ID', 'jnas-ai-core'),
    storageBucket: getEnvVar('FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnvVar('FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnvVar('FIREBASE_APP_ID'),
  },
  gemini: {
    apiKey: getEnvVar('GEMINI_API_KEY'),
    defaultModel: getEnvVar('GEMINI_MODEL', 'gemini-1.5-flash'),
    defaultTemperature: Number(getEnvVar('GEMINI_TEMPERATURE', '0.7')),
    defaultMaxTokens: Number(getEnvVar('GEMINI_MAX_TOKENS', '2048')),
    safetyLevel: getEnvVar('GEMINI_SAFETY_LEVEL', 'block_medium_above'),
  },
  providers: [
    { id: 'gemini', name: 'Google Gemini Pro', enabled: true, type: 'gemini' },
    { id: 'mock', name: 'Sandbox Offline Simulator', enabled: true, type: 'mock' }
  ],
  featureFlags: {
    enableWorkflowEngine: true,
    enableRAG: true,
    enableRealtimeSync: false,
    enableAdvancedSecurity: true,
    enableCommandCenter: true,
  },
  security: {
    corsOrigin: getEnvVar('CORS_ORIGIN', '*'),
    tokenExpiry: getEnvVar('JWT_EXPIRY', '24h'),
    rateLimitMax: Number(getEnvVar('RATE_LIMIT_MAX', '100')),
    rateLimitWindowMs: Number(getEnvVar('RATE_LIMIT_WINDOW_MS', '900000')), // 15 mins
  },
  deployment: {
    platform: isServer ? 'cloud-run' : 'local',
    ingressPort: 3000,
    sslEnabled: true,
  }
};
