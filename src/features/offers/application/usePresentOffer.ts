import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiError } from '@/shared/api/apiError';
import type { Offer } from '../domain/offer.types';
import { offerApi } from '../infrastructure/offerApi';
import { offerKeys } from './queryKeys';

/**
 * Presenta la oferta y, al terminar (éxito o error), refresca el detalle
 * y el listado sin recargar la página.
 */
export function usePresentOffer(id: number) {
  const queryClient = useQueryClient();
  return useMutation<Offer, ApiError, void>({
    mutationFn: () => offerApi.present(id),
    onSuccess: (offer) => {
      queryClient.setQueryData(offerKeys.detail(id), offer);
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: offerKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: offerKeys.list() }),
      ]),
  });
}
