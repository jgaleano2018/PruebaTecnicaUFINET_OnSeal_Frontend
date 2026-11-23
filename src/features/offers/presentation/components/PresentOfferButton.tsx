import { canBePresented } from '../../domain/offer.rules';
import type { OfferStatus } from '../../domain/offer.types';

interface PresentOfferButtonProps {
  status: OfferStatus;
  isPending: boolean;
  onPresent: () => void;
}

/** Deshabilitado si la oferta no está en BORRADOR; muestra "Presentando..." mientras espera. */
export function PresentOfferButton({ status, isPending, onPresent }: PresentOfferButtonProps) {
  const disabled = !canBePresented(status) || isPending;
  return (
    <button
      type="button"
      className="btn btn--primary"
      onClick={onPresent}
      disabled={disabled}
      title={canBePresented(status) ? undefined : 'Solo se pueden presentar ofertas en BORRADOR'}
    >
      {isPending ? 'Presentando...' : 'Presentar'}
    </button>
  );
}
