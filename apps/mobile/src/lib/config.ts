/** Production API by default; override with EXPO_PUBLIC_API_URL in apps/mobile/.env */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || "https://api-production-05746.up.railway.app").replace(/\/$/, "");
