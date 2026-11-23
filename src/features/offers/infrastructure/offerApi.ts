import { httpClient } from '@/shared/api/httpClient';
import type { CreateOfferPayload, Offer, OfferSummary } from '../domain/offer.types';

/** Puerto de acceso a datos de ofertas (permite sustituir la implementación en pruebas). */
export interface OfferRepository {
  list(): Promise<OfferSummary[]>;
  getById(id: number): Promise<Offer>;
  create(payload: CreateOfferPayload): Promise<Offer>;
  present(id: number): Promise<Offer>;
}

/** Implementación HTTP del repositorio sobre la API REST del backend. */
export const offerApi: OfferRepository = {
  async list() {
    const { data } = await httpClient.get<OfferSummary[]>('/offers');
    return data;
  },
  async getById(id) {
    const { data } = await httpClient.get<Offer>(`/offers/${id}`);
    return data;
  },
  async create(payload) {
    const { data } = await httpClient.post<Offer>('/offers', payload);
    return data;
  },
  async present(id) {
    const { data } = await httpClient.post<Offer>(`/offers/${id}/present`);
    return data;
  },
};
