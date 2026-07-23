const DEFAULT_API_URL = 'http://localhost:3000';
const DEFAULT_USER_ID = 'demo';

export const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL,
  userId: process.env.EXPO_PUBLIC_USER_ID || DEFAULT_USER_ID,
  enabled: process.env.EXPO_PUBLIC_API_ENABLED !== 'false',
};

export function isApiEnabled() {
  return API_CONFIG.enabled && Boolean(API_CONFIG.baseUrl);
}
