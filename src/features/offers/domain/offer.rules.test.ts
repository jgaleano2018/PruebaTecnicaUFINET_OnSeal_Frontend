import { describe, expect, it } from 'vitest';
import { canBePresented, OFFER_RULES, STATUS_LABELS } from './offer.rules';

describe('reglas de oferta', () => {
  it('solo una oferta en BORRADOR se puede presentar', () => {
    expect(canBePresented('BORRADOR')).toBe(true);
    expect(canBePresented('PRESENTADA')).toBe(false);
    expect(canBePresented('NO_VIABLE')).toBe(false);
  });

  it('expone los límites del modelo de datos', () => {
    expect(OFFER_RULES).toEqual({ maxClientLength: 100, minServices: 1, maxServices: 5, minMbps: 10, maxMbps: 10_000 });
    expect(STATUS_LABELS.NO_VIABLE).toBe('No viable');
  });
});
