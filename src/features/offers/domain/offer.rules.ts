import type { OfferStatus } from './offer.types';

/** Reglas del modelo de datos (idénticas a las del backend). */
export const OFFER_RULES = {
  maxClientLength: 100,
  minServices: 1,
  maxServices: 5,
  minMbps: 10,
  maxMbps: 10_000,
} as const;

export const STATUS_LABELS: Record<OfferStatus, string> = {
  BORRADOR: 'Borrador',
  PRESENTADA: 'Presentada',
  NO_VIABLE: 'No viable',
};

/** Solo una oferta en BORRADOR puede presentarse. */
export function canBePresented(status: OfferStatus): boolean {
  return status === 'BORRADOR';
}
