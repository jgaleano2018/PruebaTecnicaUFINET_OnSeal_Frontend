import { Link } from 'react-router-dom';
import { formatUsd } from '@/shared/utils/formatCurrency';
import type { OfferSummary } from '../../domain/offer.types';
import { OfferStatusBadge } from './OfferStatusBadge';

export function OfferTable({ offers }: { offers: OfferSummary[] }) {
  if (offers.length === 0) {
    return <p className="empty">Aún no hay ofertas. Crea la primera con «Nueva oferta».</p>;
  }
  return (
    <table className="table">
      <thead>
        <tr>
          <th scope="col">Id</th>
          <th scope="col">Cliente</th>
          <th scope="col">Estado</th>
          <th scope="col" className="num">MRC total</th>
        </tr>
      </thead>
      <tbody>
        {offers.map((offer) => (
          <tr key={offer.id}>
            <td>
              <Link to={`/offers/${offer.id}`}>{offer.id}</Link>
            </td>
            <td>
              <Link to={`/offers/${offer.id}`}>{offer.cliente}</Link>
            </td>
            <td>
              <OfferStatusBadge status={offer.estado} />
            </td>
            <td className="num">{formatUsd(offer.mrcTotal)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
