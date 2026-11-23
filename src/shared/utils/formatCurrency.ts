const numberFormatter = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formatea un monto en USD con 2 decimales: 343.75 -> "USD 343,75". */
export function formatUsd(amount: number): string {
  return `USD ${numberFormatter.format(amount)}`;
}
