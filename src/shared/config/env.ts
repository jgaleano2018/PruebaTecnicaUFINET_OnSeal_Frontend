const DEFAULT_API_BASE_URL = 'http://localhost:8080';

/** Configuración de entorno centralizada (Vite inyecta VITE_* en tiempo de build). */
export const env = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/+$/, ''),
} as const;
