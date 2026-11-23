import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it } from 'vitest';
import { ApiError } from './apiError';
import { httpClient } from './httpClient';

describe('httpClient', () => {
  it('apunta a /api del backend configurado', () => {
    expect(httpClient.defaults.baseURL).toBe('http://localhost:8080/api');
  });

  it('normaliza los errores como ApiError', async () => {
    const adapter = async (config: InternalAxiosRequestConfig) => {
      throw new AxiosError('Network Error', 'ERR_NETWORK', config);
    };

    await expect(httpClient.get('/offers', { adapter })).rejects.toBeInstanceOf(ApiError);
    await expect(httpClient.get('/offers', { adapter })).rejects.toMatchObject({ isNetworkError: true });
  });

  it('deja pasar las respuestas correctas', async () => {
    const adapter = async (config: InternalAxiosRequestConfig) => ({
      data: [1, 2],
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });

    await expect(httpClient.get('/offers', { adapter })).resolves.toMatchObject({ data: [1, 2] });
  });
});
