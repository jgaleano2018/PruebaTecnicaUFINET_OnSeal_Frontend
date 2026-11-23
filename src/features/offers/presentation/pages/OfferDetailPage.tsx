import { Link, useParams } from 'react-router-dom';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { LoadingState } from '@/shared/ui/LoadingState';
import { useOffer } from '../../application/useOffer';
import { usePresentOffer } from '../../application/usePresentOffer';
import { OfferStatusBadge } from '../components/OfferStatusBadge';
import { PresentOfferButton } from '../components/PresentOfferButton';
import { ServicesTable } from '../components/ServicesTable';

export function OfferDetailPage() {
  const { id: idParam } = useParams<{ id: string }>();
  const id = Number(idParam);
  const isValidId = Number.isInteger(id) && id > 0;

  const offerQuery = useOffer(id);
  const presentOffer = usePresentOffer(id);

  if (!isValidId) {
    return <ErrorMessage title="Oferta no válida" message={`El identificador «${idParam}» no es válido.`} />;
  }

  return (
    <section>
      <div className="page-header">
        <h1>Oferta #{id}</h1>
        <Link to="/offers">Volver al listado</Link>
      </div>

      {offerQuery.isPending && <LoadingState message="Cargando oferta..." />}
      {offerQuery.isError && (
        <ErrorMessage
          title={offerQuery.error.isNotFound ? 'Oferta no encontrada' : 'No se pudo cargar la oferta'}
          message={offerQuery.error.message}
          onRetry={offerQuery.error.isNotFound ? undefined : () => void offerQuery.refetch()}
        />
      )}

      {offerQuery.data && (
        <article className="card">
          <dl className="summary">
            <div>
              <dt>Cliente</dt>
              <dd>{offerQuery.data.cliente}</dd>
            </div>
            <div>
              <dt>Estado</dt>
              <dd>
                <OfferStatusBadge status={offerQuery.data.estado} />
              </dd>
            </div>
          </dl>

          <h2>Servicios</h2>
          <ServicesTable services={offerQuery.data.servicios} total={offerQuery.data.mrcTotal} />

          <div className="card__actions">
            <PresentOfferButton
              status={offerQuery.data.estado}
              isPending={presentOffer.isPending}
              onPresent={() => presentOffer.mutate()}
            />
          </div>

          {presentOffer.isError && (
            <ErrorMessage
              title={
                presentOffer.error.isConflict
                  ? 'La oferta ya no está en BORRADOR'
                  : presentOffer.error.isNotFound
                    ? 'La oferta no existe'
                    : 'No se pudo presentar la oferta'
              }
              message={presentOffer.error.message}
            />
          )}
        </article>
      )}
    </section>
  );
}
