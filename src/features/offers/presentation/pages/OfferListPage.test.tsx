import { screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, NETWORK_ERROR_MESSAGE } from '@/shared/api/apiError';
import { deferred, renderApp } from '@/test/renderWithProviders';
import { mockedOfferApi } from '@/test/mockOfferApi';
import { offerSummaries } from '@/test/fixtures';
import type { OfferSummary } from '../../domain/offer.types';

vi.mock('@/features/offers/infrastructure/offerApi', () => ({
  offerApi: { list: vi.fn(), getById: vi.fn(), create: vi.fn(), present: vi.fn() },
}));

describe('Listado de ofertas (/offers)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('la app abre directamente en el listado', async () => {
    mockedOfferApi.list.mockResolvedValue([]);
    const { router } = renderApp('/');

    expect(await screen.findByRole('heading', { name: 'Ofertas' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/offers');
  });

  it('muestra el estado de carga mientras espera la API', async () => {
    const pending = deferred<OfferSummary[]>();
    mockedOfferApi.list.mockReturnValue(pending.promise);
    renderApp('/offers');

    expect(screen.getByRole('status')).toHaveTextContent('Cargando ofertas...');
    pending.resolve(offerSummaries);
    expect(await screen.findByText('Cliente Demo S.A.')).toBeInTheDocument();
  });

  it('muestra la tabla con id, cliente, estado y MRC total', async () => {
    mockedOfferApi.list.mockResolvedValue(offerSummaries);
    renderApp('/offers');

    const table = await screen.findByRole('table');
    const headers = within(table).getAllByRole('columnheader').map((header) => header.textContent);
    expect(headers).toEqual(['Id', 'Cliente', 'Estado', 'MRC total']);

    const rows = within(table).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText('Cliente Demo S.A.')).toBeInTheDocument();
    expect(within(rows[0]).getByText('Borrador')).toBeInTheDocument();
    expect(within(rows[0]).getByText('USD 343,75')).toBeInTheDocument();
    expect(within(rows[1]).getByText('No viable')).toBeInTheDocument();
    expect(within(rows[1]).getByText('USD 2.750,00')).toBeInTheDocument();
  });

  it('muestra un mensaje cuando no hay ofertas', async () => {
    mockedOfferApi.list.mockResolvedValue([]);
    renderApp('/offers');

    expect(await screen.findByText(/Aún no hay ofertas/)).toBeInTheDocument();
  });

  it('muestra un mensaje si la API no responde y permite reintentar', async () => {
    mockedOfferApi.list
      .mockRejectedValueOnce(new ApiError({ message: NETWORK_ERROR_MESSAGE, isNetworkError: true }))
      .mockResolvedValueOnce(offerSummaries);
    const { user } = renderApp('/offers');

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('No se pudieron cargar las ofertas');
    expect(alert).toHaveTextContent(NETWORK_ERROR_MESSAGE);

    await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('Cliente Demo S.A.')).toBeInTheDocument();
    expect(mockedOfferApi.list).toHaveBeenCalledTimes(2);
  });

  it('el botón "Nueva oferta" navega al formulario y las filas al detalle', async () => {
    mockedOfferApi.list.mockResolvedValue(offerSummaries);
    const { user, router } = renderApp('/offers');

    await user.click(await screen.findByRole('link', { name: 'Nueva oferta' }));
    expect(router.state.location.pathname).toBe('/offers/new');

    await router.navigate('/offers');
    mockedOfferApi.getById.mockReturnValue(new Promise(() => {}));
    await user.click(await screen.findByRole('link', { name: 'Operador Andino Ltda.' }));
    expect(router.state.location.pathname).toBe('/offers/2');
  });

  it('muestra "Página no encontrada" en rutas desconocidas', async () => {
    renderApp('/no-existe');
    expect(await screen.findByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument();
  });
});
