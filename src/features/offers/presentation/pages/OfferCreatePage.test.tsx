import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, NETWORK_ERROR_MESSAGE } from '@/shared/api/apiError';
import { deferred, renderApp } from '@/test/renderWithProviders';
import { mockedOfferApi } from '@/test/mockOfferApi';
import { draftOffer } from '@/test/fixtures';
import type { Offer } from '../../domain/offer.types';

vi.mock('@/features/offers/infrastructure/offerApi', () => ({
  offerApi: { list: vi.fn(), getById: vi.fn(), create: vi.fn(), present: vi.fn() },
}));

const serviceRows = () => screen.getAllByRole('group', { name: /Servicio \d/ });

async function fillValidForm(user: ReturnType<typeof renderApp>['user']) {
  await user.type(screen.getByLabelText('Cliente'), 'Cliente Demo S.A.');
  await user.type(screen.getByLabelText('Mbps'), '100');
  await user.selectOptions(screen.getByLabelText('Plazo'), '36');
}

describe('Nueva oferta (/offers/new)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockedOfferApi.list.mockResolvedValue([]);
    mockedOfferApi.getById.mockResolvedValue(draftOffer);
  });

  it('muestra el formulario con una fila de servicio', () => {
    renderApp('/offers/new');

    expect(screen.getByRole('heading', { name: 'Nueva oferta' })).toBeInTheDocument();
    expect(serviceRows()).toHaveLength(1);
    expect(screen.getByLabelText('Tipo')).toHaveValue('INTERNET');
    expect(screen.getByLabelText('Plazo')).toHaveValue('12');
    expect(screen.getByLabelText('Viable')).toBeChecked();
  });

  it('"Agregar servicio" permite hasta 5 filas y "Quitar" deja mínimo 1', async () => {
    const { user } = renderApp('/offers/new');
    const addButton = screen.getByRole('button', { name: 'Agregar servicio' });

    expect(screen.getByRole('button', { name: 'Quitar servicio 1' })).toBeDisabled();

    for (let i = 0; i < 4; i += 1) {
      await user.click(addButton);
    }
    expect(serviceRows()).toHaveLength(5);
    expect(addButton).toBeDisabled();
    expect(screen.getByText('Servicios (5/5)')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Quitar servicio 3' }));
    expect(serviceRows()).toHaveLength(4);
    expect(addButton).toBeEnabled();

    for (let i = 0; i < 3; i += 1) {
      await user.click(screen.getByRole('button', { name: 'Quitar servicio 1' }));
    }
    expect(serviceRows()).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Quitar servicio 1' })).toBeDisabled();
  });

  it('valida en el navegador y no llama a la API si hay errores', async () => {
    const { user } = renderApp('/offers/new');

    await user.click(screen.getByRole('button', { name: 'Guardar oferta' }));

    expect(await screen.findByText('El cliente es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('Los Mbps son obligatorios')).toBeInTheDocument();
    expect(screen.getByLabelText('Cliente')).toHaveAttribute('aria-invalid', 'true');
    expect(mockedOfferApi.create).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText('Mbps'), '5');
    expect(screen.getByText('Los Mbps deben estar entre 10 y 10000')).toBeInTheDocument();
    await user.clear(screen.getByLabelText('Mbps'));
    await user.type(screen.getByLabelText('Mbps'), '50');
    expect(screen.queryByText(/Los Mbps/)).not.toBeInTheDocument();
  });

  it('valida el largo máximo del cliente', async () => {
    const { user } = renderApp('/offers/new');
    await user.click(screen.getByLabelText('Cliente'));
    await user.paste('x'.repeat(101));
    await user.type(screen.getByLabelText('Mbps'), '100');
    await user.click(screen.getByRole('button', { name: 'Guardar oferta' }));

    expect(await screen.findByText('El cliente no puede superar 100 caracteres')).toBeInTheDocument();
    expect(mockedOfferApi.create).not.toHaveBeenCalled();
  });

  it('envía la oferta, muestra "Guardando..." y navega al detalle', async () => {
    const pending = deferred<Offer>();
    mockedOfferApi.create.mockReturnValue(pending.promise);
    const { user, router } = renderApp('/offers/new');

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Agregar servicio' }));
    await user.selectOptions(screen.getAllByLabelText('Tipo')[1], 'CAPACIDAD');
    await user.type(screen.getAllByLabelText('Mbps')[1], '50');
    await user.selectOptions(screen.getAllByLabelText('Plazo')[1], '24');
    await user.click(screen.getAllByLabelText('Viable')[1]);
    await user.click(screen.getByRole('button', { name: 'Guardar oferta' }));

    expect(await screen.findByRole('button', { name: 'Guardando...' })).toBeDisabled();
    expect(mockedOfferApi.create).toHaveBeenCalledWith({
      cliente: 'Cliente Demo S.A.',
      servicios: [
        { tipo: 'INTERNET', mbps: 100, plazoMeses: 36, viable: true },
        { tipo: 'CAPACIDAD', mbps: 50, plazoMeses: 24, viable: false },
      ],
    });

    pending.resolve(draftOffer);
    await waitFor(() => expect(router.state.location.pathname).toBe('/offers/1'));
    expect(await screen.findByRole('heading', { name: 'Oferta #1' })).toBeInTheDocument();
  });

  it('muestra los errores 400 que devuelve la API en cada campo', async () => {
    mockedOfferApi.create.mockRejectedValue(
      new ApiError({
        message: 'La solicitud contiene errores de validación',
        status: 400,
        fieldErrors: [{ field: 'servicios[0].mbps', message: 'Los Mbps deben estar entre 10 y 10000' }],
      }),
    );
    const { user, router } = renderApp('/offers/new');

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Guardar oferta' }));

    const alert = await screen.findByText('La API rechazó la oferta');
    expect(alert.closest('[role="alert"]')).toHaveTextContent('La solicitud contiene errores de validación');
    expect(screen.getByText('servicios[0].mbps: Los Mbps deben estar entre 10 y 10000')).toBeInTheDocument();
    expect(screen.getByLabelText('Mbps')).toHaveAttribute('aria-invalid', 'true');
    expect(router.state.location.pathname).toBe('/offers/new');
  });

  it('muestra un mensaje si la API no responde al guardar', async () => {
    mockedOfferApi.create.mockRejectedValue(new ApiError({ message: NETWORK_ERROR_MESSAGE, isNetworkError: true }));
    const { user } = renderApp('/offers/new');

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Guardar oferta' }));

    expect(await screen.findByText('No se pudo guardar la oferta')).toBeInTheDocument();
    expect(screen.getByText(NETWORK_ERROR_MESSAGE)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar oferta' })).toBeEnabled();
  });
});
