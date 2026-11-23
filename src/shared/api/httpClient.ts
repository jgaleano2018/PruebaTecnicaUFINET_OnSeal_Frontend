import axios from 'axios';
import { env } from '@/shared/config/env';
import { toApiError } from './apiError';

/** Cliente HTTP único de la aplicación. Todos los errores salen normalizados como ApiError. */
export const httpClient = axios.create({
  baseURL: `${env.apiBaseUrl}/api`,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
);
