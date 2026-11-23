import { describe, expect, it } from 'vitest';
import { ApiError } from '@/shared/api/apiError';
import { createQueryClient, shouldRetry } from './queryClient';

describe('queryClient', () => {
  it('no reintenta errores 4xx', () => {
    expect(shouldRetry(0, new ApiError({ message: 'x', status: 404 }))).toBe(false);
  });

  it('reintenta una vez errores de red o 5xx', () => {
    expect(shouldRetry(0, new ApiError({ message: 'x', isNetworkError: true }))).toBe(true);
    expect(shouldRetry(0, new ApiError({ message: 'x', status: 500 }))).toBe(true);
    expect(shouldRetry(1, new ApiError({ message: 'x', status: 500 }))).toBe(false);
  });

  it('crea el cliente con la política de reintentos', () => {
    const client = createQueryClient();
    expect(client.getDefaultOptions().queries?.retry).toBe(shouldRetry);
    expect(client.getDefaultOptions().mutations?.retry).toBe(false);
  });
});
