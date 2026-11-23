import { useEffect, type FormEvent } from 'react';
import type { FieldError as ApiFieldError } from '@/shared/api/apiError';
import { useOfferForm } from '../../application/useOfferForm';
import { OFFER_RULES } from '../../domain/offer.rules';
import type { OfferFormValues } from '../../domain/offerForm';
import { FieldError } from './FieldError';
import { ServiceRowFields } from './ServiceRowFields';

interface OfferFormProps {
  onSubmit: (values: OfferFormValues) => void;
  isSubmitting: boolean;
  serverErrors?: ApiFieldError[];
}

export function OfferForm({ onSubmit, isSubmitting, serverErrors }: OfferFormProps) {
  const form = useOfferForm();
  const { applyServerErrors } = form;

  useEffect(() => {
    if (serverErrors && serverErrors.length > 0) {
      applyServerErrors(serverErrors);
    }
    // applyServerErrors solo depende de setState (estable)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverErrors]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.validate()) {
      onSubmit(form.values);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="cliente">Cliente</label>
        <input
          id="cliente"
          type="text"
          value={form.values.cliente}
          onChange={(event) => form.setClient(event.target.value)}
          disabled={isSubmitting}
          aria-invalid={Boolean(form.errors.cliente)}
          aria-describedby={form.errors.cliente ? 'cliente-error' : undefined}
        />
        <FieldError id="cliente-error" message={form.errors.cliente} />
      </div>

      <div className="services">
        <div className="services__header">
          <h2>
            Servicios ({form.values.servicios.length}/{OFFER_RULES.maxServices})
          </h2>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={form.addService}
            disabled={!form.canAddService || isSubmitting}
          >
            Agregar servicio
          </button>
        </div>
        <FieldError id="servicios-error" message={form.errors.servicios} />

        {form.values.servicios.map((service, index) => (
          <ServiceRowFields
            key={service.key}
            index={index}
            service={service}
            errors={form.errors}
            canRemove={form.canRemoveService}
            disabled={isSubmitting}
            onChange={(field, value) => form.setServiceField(index, field, value)}
            onRemove={() => form.removeService(index)}
          />
        ))}
      </div>

      <div className="form__actions">
        <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar oferta'}
        </button>
      </div>
    </form>
  );
}
