import { useQuery } from '@tanstack/react-query';
import type { ApiError } from '@/shared/api/apiError';
import type { Offer } from '../domain/offer.types';
import { offerApi } from '../infrastructure/offerApi';
import { offerKeys } from './queryKeys';

export function useOffer(id: number) {
  return useQuery<Offer, ApiError>({
    queryKey: offerKeys.detail(id),
    queryFn: () => offerApi.getById(id),
    enabled: Number.isInteger(id) && id > 0,
  });
}
