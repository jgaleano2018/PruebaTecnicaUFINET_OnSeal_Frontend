import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiError } from '@/shared/api/apiError';
import type { CreateOfferPayload, Offer } from '../domain/offer.types';
import { offerApi } from '../infrastructure/offerApi';
import { offerKeys } from './queryKeys';

export function useCreateOffer() {
  const queryClient = useQueryClient();
  return useMutation<Offer, ApiError, CreateOfferPayload>({
    mutationFn: (payload) => offerApi.create(payload),
    onSuccess: (offer) => {
      queryClient.setQueryData(offerKeys.detail(offer.id), offer);
      return queryClient.invalidateQueries({ queryKey: offerKeys.list() });
    },
  });
}
