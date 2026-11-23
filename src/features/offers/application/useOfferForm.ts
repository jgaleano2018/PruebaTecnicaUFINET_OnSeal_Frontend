import { useState } from 'react';
import type { FieldError } from '@/shared/api/apiError';
import { OFFER_RULES } from '../domain/offer.rules';
import {
  createEmptyService,
  createInitialFormValues,
  hasErrors,
  validateOfferForm,
  type FormErrors,
  type OfferFormValues,
  type ServiceFormValues,
} from '../domain/offerForm';

type EditableServiceField = Exclude<keyof ServiceFormValues, 'key'>;

/** Estado y comportamiento del formulario de nueva oferta (sin dependencias de UI). */
export function useOfferForm(initialValues: OfferFormValues = createInitialFormValues()) {
  const [values, setValues] = useState<OfferFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const revalidate = (next: OfferFormValues) => {
    if (submitted) {
      setErrors(validateOfferForm(next));
    }
  };

  const update = (next: OfferFormValues) => {
    setValues(next);
    revalidate(next);
  };

  const setClient = (cliente: string) => update({ ...values, cliente });

  const setServiceField = <K extends EditableServiceField>(index: number, field: K, value: ServiceFormValues[K]) =>
    update({
      ...values,
      servicios: values.servicios.map((service, i) => (i === index ? { ...service, [field]: value } : service)),
    });

  const canAddService = values.servicios.length < OFFER_RULES.maxServices;
  const canRemoveService = values.servicios.length > OFFER_RULES.minServices;

  const addService = () => {
    if (canAddService) {
      update({ ...values, servicios: [...values.servicios, createEmptyService()] });
    }
  };

  const removeService = (index: number) => {
    if (canRemoveService) {
      update({ ...values, servicios: values.servicios.filter((_, i) => i !== index) });
    }
  };

  /** Valida todo el formulario; devuelve true si se puede enviar. */
  const validate = (): boolean => {
    setSubmitted(true);
    const nextErrors = validateOfferForm(values);
    setErrors(nextErrors);
    return !hasErrors(nextErrors);
  };

  /** Muestra en cada campo los errores 400 devueltos por la API. */
  const applyServerErrors = (fieldErrors: FieldError[]) => {
    setErrors(Object.fromEntries(fieldErrors.map(({ field, message }) => [field, message])));
  };

  return {
    values,
    errors,
    setClient,
    setServiceField,
    addService,
    removeService,
    canAddService,
    canRemoveService,
    validate,
    applyServerErrors,
  };
}
