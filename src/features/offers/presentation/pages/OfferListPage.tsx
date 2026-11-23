import { Link } from 'react-router-dom';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { LoadingState } from '@/shared/ui/LoadingState';
import { useOffers } from '../../application/useOffers';
import { OfferTable } from '../components/OfferTable';

export function OfferListPage() {
  const { data, isPending, isError, error, refetch, isFetching } = useOffers();

  return (
    <section>
      <div className="page-header">
        <h1>Ofertas</h1>
        <Link to="/offers/new" className="btn btn--primary">
          Nueva oferta
        </Link>
      </div>

      {isPending && <LoadingState message="Cargando ofertas..." />}
      {isError && (
        <ErrorMessage
          title="No se pudieron cargar las ofertas"
          message={error.message}
          onRetry={() => void refetch()}
        />
      )}
      {data && (
        <>
          {isFetching && <LoadingState message="Actualizando..." />}
          <OfferTable offers={data} />
        </>
      )}
    </section>
  );
}
