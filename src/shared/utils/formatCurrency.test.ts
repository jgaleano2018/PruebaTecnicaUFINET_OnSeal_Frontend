import { describe, expect, it } from 'vitest';
import { formatUsd } from './formatCurrency';

describe('formatUsd', () => {
  it.each([
    [343.75, 'USD 343,75'],
    [225, 'USD 225,00'],
    [22500, 'USD 22.500,00'],
    [0, 'USD 0,00'],
  ])('%s -> %s', (amount, expected) => {
    expect(formatUsd(amount)).toBe(expected);
  });
});
