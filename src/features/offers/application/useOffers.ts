import { useQuery } from '@tanstack/react-query';
import type { ApiError } from '@/shared/api/apiError';
import type { OfferSummary } from '../domain/offer.types';
import { offerApi } from '../infrastructure/offerApi';
import { offerKeys } from './queryKeys';

export function useOffers() {
  return useQuery<OfferSummary[], ApiError>({
    queryKey: offerKeys.list(),
    queryFn: () => offerApi.list(),
  });
}
