import { OFFER_RULES } from './offer.rules';
import {
  CONTRACT_TERMS,
  SERVICE_TYPES,
  type ContractTerm,
  type CreateOfferPayload,
  type ServiceType,
} from './offer.types';

/** Valores editables del formulario (mbps como texto para permitir edición libre). */
export interface ServiceFormValues {
  key: string;
  tipo: ServiceType;
  mbps: string;
  plazoMeses: ContractTerm;
  viable: boolean;
}

export interface OfferFormValues {
  cliente: string;
  servicios: ServiceFormValues[];
}

/** Errores indexados con la misma ruta que usa el backend: "cliente", "servicios[0].mbps"... */
export type FormErrors = Record<string, string>;

let keySequence = 0;
export function nextServiceKey(): string {
  keySequence += 1;
  return `service-${keySequence}`;
}

export function createEmptyService(): ServiceFormValues {
  return { key: nextServiceKey(), tipo: 'INTERNET', mbps: '', plazoMeses: 12, viable: true };
}

export function createInitialFormValues(): OfferFormValues {
  return { cliente: '', servicios: [createEmptyService()] };
}

export const servicePath = (index: number, field: keyof Omit<ServiceFormValues, 'key'>) =>
  `servicios[${index}].${field}`;

/** Valida en el navegador las mismas reglas que el backend. */
export function validateOfferForm(values: OfferFormValues): FormErrors {
  const errors: FormErrors = {};
  const client = values.cliente.trim();

  if (!client) {
    errors.cliente = 'El cliente es obligatorio';
  } else if (client.length > OFFER_RULES.maxClientLength) {
    errors.cliente = `El cliente no puede superar ${OFFER_RULES.maxClientLength} caracteres`;
  }

  const count = values.servicios.length;
  if (count < OFFER_RULES.minServices || count > OFFER_RULES.maxServices) {
    errors.servicios = `La oferta debe tener entre ${OFFER_RULES.minServices} y ${OFFER_RULES.maxServices} servicios`;
  }

  values.servicios.forEach((service, index) => {
    if (!SERVICE_TYPES.includes(service.tipo)) {
      errors[servicePath(index, 'tipo')] = 'El tipo es obligatorio (INTERNET o CAPACIDAD)';
    }
    const mbpsText = service.mbps.trim();
    if (!mbpsText) {
      errors[servicePath(index, 'mbps')] = 'Los Mbps son obligatorios';
    } else if (!/^\d+$/.test(mbpsText)) {
      errors[servicePath(index, 'mbps')] = 'Los Mbps deben ser un número entero';
    } else {
      const mbps = Number(mbpsText);
      if (mbps < OFFER_RULES.minMbps || mbps > OFFER_RULES.maxMbps) {
        errors[servicePath(index, 'mbps')] = `Los Mbps deben estar entre ${OFFER_RULES.minMbps} y ${OFFER_RULES.maxMbps}`;
      }
    }
    if (!CONTRACT_TERMS.includes(service.plazoMeses)) {
      errors[servicePath(index, 'plazoMeses')] = 'El plazo debe ser 12, 24 o 36 meses';
    }
  });

  return errors;
}

export function hasErrors(errors: FormErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** Convierte los valores del formulario (ya validados) al cuerpo que espera la API. */
export function toCreateOfferPayload(values: OfferFormValues): CreateOfferPayload {
  return {
    cliente: values.cliente.trim(),
    servicios: values.servicios.map(({ tipo, mbps, plazoMeses, viable }) => ({
      tipo,
      mbps: Number(mbps.trim()),
      plazoMeses,
      viable,
    })),
  };
}
