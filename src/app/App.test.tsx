import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { mockedOfferApi } from '@/test/mockOfferApi';
import { App } from './App';

vi.mock('@/features/offers/infrastructure/offerApi', () => ({
  offerApi: { list: vi.fn(), getById: vi.fn(), create: vi.fn(), present: vi.fn() },
}));

describe('App', () => {
  it('arranca sin login directamente en el listado de ofertas', async () => {
    mockedOfferApi.list.mockResolvedValue([]);
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Ofertas' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/offers');
    expect(screen.getByRole('link', { name: 'Ufinet · Ofertas' })).toHaveAttribute('href', '/offers');
  });
});
