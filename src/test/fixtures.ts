import type { Offer, OfferSummary } from '@/features/offers/domain/offer.types';

export const draftOffer: Offer = {
  id: 1,
  cliente: 'Cliente Demo S.A.',
  estado: 'BORRADOR',
  version: 0,
  servicios: [
    { id: 1, tipo: 'INTERNET', mbps: 100, plazoMeses: 36, viable: true, mrc: 225 },
    { id: 2, tipo: 'CAPACIDAD', mbps: 50, plazoMeses: 24, viable: true, mrc: 118.75 },
  ],
  mrcTotal: 343.75,
};

export const offerSummaries: OfferSummary[] = [
  { id: 1, cliente: 'Cliente Demo S.A.', estado: 'BORRADOR', mrcTotal: 343.75 },
  { id: 2, cliente: 'Operador Andino Ltda.', estado: 'NO_VIABLE', mrcTotal: 2750 },
];
