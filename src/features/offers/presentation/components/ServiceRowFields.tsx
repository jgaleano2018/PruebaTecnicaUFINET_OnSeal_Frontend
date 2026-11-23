import { CONTRACT_TERMS, SERVICE_TYPES, type ContractTerm, type ServiceType } from '../../domain/offer.types';
import { OFFER_RULES } from '../../domain/offer.rules';
import { servicePath, type FormErrors, type ServiceFormValues } from '../../domain/offerForm';
import { FieldError } from './FieldError';

interface ServiceRowFieldsProps {
  index: number;
  service: ServiceFormValues;
  errors: FormErrors;
  canRemove: boolean;
  disabled: boolean;
  onChange: <K extends Exclude<keyof ServiceFormValues, 'key'>>(field: K, value: ServiceFormValues[K]) => void;
  onRemove: () => void;
}

export function ServiceRowFields({ index, service, errors, canRemove, disabled, onChange, onRemove }: ServiceRowFieldsProps) {
  const number = index + 1;
  const idFor = (field: string) => `service-${index}-${field}`;
  const errorOf = (field: 'tipo' | 'mbps' | 'plazoMeses' | 'viable') => errors[servicePath(index, field)];

  return (
    <fieldset className="service-row" disabled={disabled} aria-label={`Servicio ${number}`}>
      <legend>Servicio {number}</legend>

      <div className="field">
        <label htmlFor={idFor('tipo')}>Tipo</label>
        <select
          id={idFor('tipo')}
          value={service.tipo}
          onChange={(event) => onChange('tipo', event.target.value as ServiceType)}
          aria-invalid={Boolean(errorOf('tipo'))}
        >
          {SERVICE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <FieldError id={`${idFor('tipo')}-error`} message={errorOf('tipo')} />
      </div>

      <div className="field">
        <label htmlFor={idFor('mbps')}>Mbps</label>
        <input
          id={idFor('mbps')}
          type="number"
          inputMode="numeric"
          min={OFFER_RULES.minMbps}
          max={OFFER_RULES.maxMbps}
          step={1}
          value={service.mbps}
          onChange={(event) => onChange('mbps', event.target.value)}
          aria-invalid={Boolean(errorOf('mbps'))}
          aria-describedby={errorOf('mbps') ? `${idFor('mbps')}-error` : undefined}
        />
        <FieldError id={`${idFor('mbps')}-error`} message={errorOf('mbps')} />
      </div>

      <div className="field">
        <label htmlFor={idFor('plazo')}>Plazo</label>
        <select
          id={idFor('plazo')}
          value={service.plazoMeses}
          onChange={(event) => onChange('plazoMeses', Number(event.target.value) as ContractTerm)}
          aria-invalid={Boolean(errorOf('plazoMeses'))}
        >
          {CONTRACT_TERMS.map((term) => (
            <option key={term} value={term}>
              {term} meses
            </option>
          ))}
        </select>
        <FieldError id={`${idFor('plazo')}-error`} message={errorOf('plazoMeses')} />
      </div>

      <div className="field field--checkbox">
        <input
          id={idFor('viable')}
          type="checkbox"
          checked={service.viable}
          onChange={(event) => onChange('viable', event.target.checked)}
        />
        <label htmlFor={idFor('viable')}>Viable</label>
        <FieldError id={`${idFor('viable')}-error`} message={errorOf('viable')} />
      </div>

      <button
        type="button"
        className="btn btn--danger"
        onClick={onRemove}
        disabled={!canRemove}
        aria-label={`Quitar servicio ${number}`}
      >
        Quitar
      </button>
    </fieldset>
  );
}
