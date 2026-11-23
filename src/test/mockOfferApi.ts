import { vi } from 'vitest';
import { offerApi } from '@/features/offers/infrastructure/offerApi';

/** Acceso tipado a los mocks del repositorio de ofertas (requiere vi.mock en el test). */
export const mockedOfferApi = vi.mocked(offerApi);
