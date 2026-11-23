/** Modelo de dominio del frontend: refleja el contrato de la API /api/offers. */

export const SERVICE_TYPES = ['INTERNET', 'CAPACIDAD'] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export const OFFER_STATUSES = ['BORRADOR', 'PRESENTADA', 'NO_VIABLE'] as const;
export type OfferStatus = (typeof OFFER_STATUSES)[number];

export const CONTRACT_TERMS = [12, 24, 36] as const;
export type ContractTerm = (typeof CONTRACT_TERMS)[number];

export interface OfferService {
  id: number;
  tipo: ServiceType;
  mbps: number;
  plazoMeses: ContractTerm;
  viable: boolean;
  mrc: number;
}

export interface Offer {
  id: number;
  cliente: string;
  estado: OfferStatus;
  version: number;
  servicios: OfferService[];
  mrcTotal: number;
}

export interface OfferSummary {
  id: number;
  cliente: string;
  estado: OfferStatus;
  mrcTotal: number;
}

export interface CreateServicePayload {
  tipo: ServiceType;
  mbps: number;
  plazoMeses: ContractTerm;
  viable: boolean;
}

export interface CreateOfferPayload {
  cliente: string;
  servicios: CreateServicePayload[];
}
