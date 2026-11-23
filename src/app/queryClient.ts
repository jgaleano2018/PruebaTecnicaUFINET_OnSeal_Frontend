import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/api/apiError';

/** No reintenta errores 4xx (son definitivos); reintenta una vez errores de red o 5xx. */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status !== undefined && error.status < 500) {
    return false;
  }
  return failureCount < 1;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: shouldRetry, staleTime: 10_000, refetchOnWindowFocus: true },
      mutations: { retry: false },
    },
  });
}
