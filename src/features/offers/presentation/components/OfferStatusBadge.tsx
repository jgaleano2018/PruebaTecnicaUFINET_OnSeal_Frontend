import { STATUS_LABELS } from '../../domain/offer.rules';
import type { OfferStatus } from '../../domain/offer.types';

export function OfferStatusBadge({ status }: { status: OfferStatus }) {
  return <span className={`badge badge--${status.toLowerCase()}`}>{STATUS_LABELS[status]}</span>;
}
