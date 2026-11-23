import { beforeEach, describe, expect, it, vi } from 'vitest';
import { httpClient } from '@/shared/api/httpClient';
import { draftOffer, offerSummaries } from '@/test/fixtures';
import { offerApi } from './offerApi';

describe('offerApi (adaptador HTTP)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('GET /offers', async () => {
    const get = vi.spyOn(httpClient, 'get').mockResolvedValue({ data: offerSummaries });
    await expect(offerApi.list()).resolves.toEqual(offerSummaries);
    expect(get).toHaveBeenCalledWith('/offers');
  });

  it('GET /offers/{id}', async () => {
    const get = vi.spyOn(httpClient, 'get').mockResolvedValue({ data: draftOffer });
    await expect(offerApi.getById(1)).resolves.toEqual(draftOffer);
    expect(get).toHaveBeenCalledWith('/offers/1');
  });

  it('POST /offers', async () => {
    const post = vi.spyOn(httpClient, 'post').mockResolvedValue({ data: draftOffer });
    const payload = { cliente: 'C', servicios: [{ tipo: 'INTERNET' as const, mbps: 100, plazoMeses: 36 as const, viable: true }] };
    await expect(offerApi.create(payload)).resolves.toEqual(draftOffer);
    expect(post).toHaveBeenCalledWith('/offers', payload);
  });

  it('POST /offers/{id}/present', async () => {
    const post = vi.spyOn(httpClient, 'post').mockResolvedValue({ data: { ...draftOffer, estado: 'PRESENTADA' } });
    await expect(offerApi.present(1)).resolves.toMatchObject({ estado: 'PRESENTADA' });
    expect(post).toHaveBeenCalledWith('/offers/1/present');
  });
});
