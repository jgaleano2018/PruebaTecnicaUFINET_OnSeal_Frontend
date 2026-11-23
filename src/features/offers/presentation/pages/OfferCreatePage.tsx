import { Link, useNavigate } from 'react-router-dom';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { LoadingState } from '@/shared/ui/LoadingState';
import { useCreateOffer } from '../../application/useCreateOffer';
import { toCreateOfferPayload, type OfferFormValues } from '../../domain/offerForm';
import { OfferForm } from '../components/OfferForm';

export function OfferCreatePage() {
  const navigate = useNavigate();
  const createOffer = useCreateOffer();
  const apiError = createOffer.error;

  const handleSubmit = (values: OfferFormValues) => {
    createOffer.mutate(toCreateOfferPayload(values), {
      onSuccess: (offer) => navigate(`/offers/${offer.id}`),
    });
  };

  return (
    <section>
      <div className="page-header">
        <h1>Nueva oferta</h1>
        <Link to="/offers">Volver al listado</Link>
      </div>

      {createOffer.isPending && <LoadingState message="Guardando oferta..." />}
      {apiError && (
        <ErrorMessage
          title={apiError.isValidationError ? 'La API rechazó la oferta' : 'No se pudo guardar la oferta'}
          message={apiError.message}
          details={apiError.fieldErrors.map(({ field, message }) => `${field}: ${message}`)}
        />
      )}

      <OfferForm
        onSubmit={handleSubmit}
        isSubmitting={createOffer.isPending}
        serverErrors={apiError?.fieldErrors}
      />
    </section>
  );
}
