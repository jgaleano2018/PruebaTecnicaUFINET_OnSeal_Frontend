import { screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, NETWORK_ERROR_MESSAGE } from '@/shared/api/apiError';
import { deferred, renderApp } from '@/test/renderWithProviders';
import { mockedOfferApi } from '@/test/mockOfferApi';
import { draftOffer, offerSummaries } from '@/test/fixtures';
import type { Offer } from '../../domain/offer.types';
import { offerKeys } from '../../application/queryKeys';

vi.mock('@/features/offers/infrastructure/offerApi', () => ({
  offerApi: { list: vi.fn(), getById: vi.fn(), create: vi.fn(), present: vi.fn() },
}));

const presented: Offer = { ...draftOffer, estado: 'PRESENTADA', version: 1 };

describe('Detalle de oferta (/offers/:id)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockedOfferApi.list.mockResolvedValue(offerSummaries);
  });

  it('muestra carga y luego cliente, estado, servicios con su MRC y total en USD', async () => {
    const pending = deferred<Offer>();
    mockedOfferApi.getById.mockReturnValue(pending.promise);
    renderApp('/offers/1');

    expect(screen.getByRole('status')).toHaveTextContent('Cargando oferta...');
    pending.resolve(draftOffer);

    expect(await screen.findByText('Cliente Demo S.A.')).toBeInTheDocument();
    expect(screen.getByText('Borrador')).toBeInTheDocument();
    const rows = within(screen.getByRole('table')).getAllByRole('row');
    expect(rows[1]).toHaveTextContent('INTERNET');
    expect(rows[1]).toHaveTextContent('36 meses');
    expect(rows[1]).toHaveTextContent('USD 225,00');
    expect(rows[2]).toHaveTextContent('CAPACIDAD');
    expect(rows[2]).toHaveTextContent('USD 118,75');
    expect(screen.getByTestId('mrc-total')).toHaveTextContent('USD 343,75');
    expect(mockedOfferApi.getById).toHaveBeenCalledWith(1);
  });

  it('"Presentar" muestra "Presentando..." y refresca la oferta y el listado sin recargar', async () => {
    mockedOfferApi.getById.mockResolvedValueOnce(draftOffer).mockResolvedValue(presented);
    const pending = deferred<Offer>();
    mockedOfferApi.present.mockReturnValue(pending.promise);
    const { user, queryClient } = renderApp('/offers/1');
    await queryClient.prefetchQuery({ queryKey: offerKeys.list(), queryFn: () => Promise.resolve(offerSummaries) });
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    await user.click(await screen.findByRole('button', { name: 'Presentar' }));

    expect(await screen.findByRole('button', { name: 'Presentando...' })).toBeDisabled();
    pending.resolve(presented);

    expect(await screen.findByText('Presentada')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Presentar' })).toBeDisabled();
    expect(mockedOfferApi.present).toHaveBeenCalledWith(1);
    await waitFor(() => {
      expect(invalidate).toHaveBeenCalledWith({ queryKey: offerKeys.list() });
      expect(invalidate).toHaveBeenCalledWith({ queryKey: offerKeys.detail(1) });
    });
  });

  it.each(['PRESENTADA', 'NO_VIABLE'] as const)('"Presentar" está deshabilitado si el estado es %s', async (estado) => {
    mockedOfferApi.getById.mockResolvedValue({ ...draftOffer, estado });
    renderApp('/offers/1');

    expect(await screen.findByRole('button', { name: 'Presentar' })).toBeDisabled();
  });

  it('muestra el mensaje del 409 si la oferta ya no está en BORRADOR', async () => {
    mockedOfferApi.getById.mockResolvedValueOnce(draftOffer).mockResolvedValue(presented);
    mockedOfferApi.present.mockRejectedValue(
      new ApiError({
        status: 409,
        message: 'La oferta 1 no se puede presentar porque su estado es PRESENTADA; solo se pueden presentar ofertas en BORRADOR',
      }),
    );
    const { user } = renderApp('/offers/1');

    await user.click(await screen.findByRole('button', { name: 'Presentar' }));

    expect(await screen.findByText('La oferta ya no está en BORRADOR')).toBeInTheDocument();
    expect(screen.getByText(/su estado es PRESENTADA/)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Presentar' })).toBeDisabled());
  });

  it('muestra el mensaje del 404 al presentar una oferta inexistente', async () => {
    mockedOfferApi.getById.mockResolvedValue(draftOffer);
    mockedOfferApi.present.mockRejectedValue(new ApiError({ status: 404, message: 'No existe una oferta con id 1' }));
    const { user } = renderApp('/offers/1');

    await user.click(await screen.findByRole('button', { name: 'Presentar' }));

    expect(await screen.findByText('La oferta no existe')).toBeInTheDocument();
    expect(screen.getByText('No existe una oferta con id 1')).toBeInTheDocument();
  });

  it('muestra un mensaje genérico si la presentación falla por otro motivo', async () => {
    mockedOfferApi.getById.mockResolvedValue(draftOffer);
    mockedOfferApi.present.mockRejectedValue(new ApiError({ message: NETWORK_ERROR_MESSAGE, isNetworkError: true }));
    const { user } = renderApp('/offers/1');

    await user.click(await screen.findByRole('button', { name: 'Presentar' }));

    expect(await screen.findByText('No se pudo presentar la oferta')).toBeInTheDocument();
  });

  it('muestra "Oferta no encontrada" si la oferta no existe (404)', async () => {
    mockedOfferApi.getById.mockRejectedValue(new ApiError({ status: 404, message: 'No existe una oferta con id 99' }));
    renderApp('/offers/99');

    expect(await screen.findByText('Oferta no encontrada')).toBeInTheDocument();
    expect(screen.getByText('No existe una oferta con id 99')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
  });

  it('muestra un mensaje si la API no responde y permite reintentar', async () => {
    mockedOfferApi.getById
      .mockRejectedValueOnce(new ApiError({ message: NETWORK_ERROR_MESSAGE, isNetworkError: true }))
      .mockResolvedValue(draftOffer);
    const { user } = renderApp('/offers/1');

    expect(await screen.findByText('No se pudo cargar la oferta')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('Cliente Demo S.A.')).toBeInTheDocument();
  });

  it('rechaza identificadores no válidos sin llamar a la API', async () => {
    renderApp('/offers/abc');

    expect(await screen.findByText('Oferta no válida')).toBeInTheDocument();
    expect(mockedOfferApi.getById).not.toHaveBeenCalled();
  });
});
