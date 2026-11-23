import { describe, expect, it } from 'vitest';
import {
  createEmptyService,
  createInitialFormValues,
  hasErrors,
  toCreateOfferPayload,
  validateOfferForm,
  type OfferFormValues,
  type ServiceFormValues,
} from './offerForm';

const service = (overrides: Partial<ServiceFormValues> = {}): ServiceFormValues => ({
  ...createEmptyService(),
  mbps: '100',
  ...overrides,
});

const form = (overrides: Partial<OfferFormValues> = {}): OfferFormValues => ({
  cliente: 'Cliente Demo S.A.',
  servicios: [service()],
  ...overrides,
});

describe('validateOfferForm (mismas reglas que el backend)', () => {
  it('acepta un formulario válido', () => {
    expect(validateOfferForm(form())).toEqual({});
  });

  it('exige el cliente', () => {
    expect(validateOfferForm(form({ cliente: '   ' }))).toEqual({ cliente: 'El cliente es obligatorio' });
  });

  it('limita el cliente a 100 caracteres', () => {
    expect(validateOfferForm(form({ cliente: 'x'.repeat(100) }))).toEqual({});
    expect(validateOfferForm(form({ cliente: 'x'.repeat(101) }))).toEqual({
      cliente: 'El cliente no puede superar 100 caracteres',
    });
  });

  it('exige entre 1 y 5 servicios', () => {
    const message = 'La oferta debe tener entre 1 y 5 servicios';
    expect(validateOfferForm(form({ servicios: [] })).servicios).toBe(message);
    expect(validateOfferForm(form({ servicios: Array.from({ length: 6 }, () => service()) })).servicios).toBe(message);
    expect(validateOfferForm(form({ servicios: Array.from({ length: 5 }, () => service()) }))).toEqual({});
  });

  it.each([
    ['', 'Los Mbps son obligatorios'],
    ['abc', 'Los Mbps deben ser un número entero'],
    ['10.5', 'Los Mbps deben ser un número entero'],
    ['9', 'Los Mbps deben estar entre 10 y 10000'],
    ['10001', 'Los Mbps deben estar entre 10 y 10000'],
  ])('valida Mbps = "%s"', (mbps, message) => {
    expect(validateOfferForm(form({ servicios: [service(), service({ mbps })] }))).toEqual({
      'servicios[1].mbps': message,
    });
  });

  it.each(['10', '10000', ' 500 '])('acepta Mbps límite "%s"', (mbps) => {
    expect(validateOfferForm(form({ servicios: [service({ mbps })] }))).toEqual({});
  });

  it('valida tipo y plazo permitidos', () => {
    const invalid = service({ tipo: 'VOZ' as never, plazoMeses: 18 as never });
    expect(validateOfferForm(form({ servicios: [invalid] }))).toEqual({
      'servicios[0].tipo': 'El tipo es obligatorio (INTERNET o CAPACIDAD)',
      'servicios[0].plazoMeses': 'El plazo debe ser 12, 24 o 36 meses',
    });
  });
});

describe('utilidades del formulario', () => {
  it('crea el formulario inicial con una fila por defecto', () => {
    const initial = createInitialFormValues();
    expect(initial.cliente).toBe('');
    expect(initial.servicios).toHaveLength(1);
    expect(initial.servicios[0]).toMatchObject({ tipo: 'INTERNET', mbps: '', plazoMeses: 12, viable: true });
  });

  it('genera claves únicas por fila', () => {
    expect(createEmptyService().key).not.toBe(createEmptyService().key);
  });

  it('hasErrors detecta errores', () => {
    expect(hasErrors({})).toBe(false);
    expect(hasErrors({ cliente: 'x' })).toBe(true);
  });

  it('convierte los valores al cuerpo de la API', () => {
    const payload = toCreateOfferPayload(
      form({
        cliente: '  Cliente Demo S.A. ',
        servicios: [service({ mbps: '100', plazoMeses: 36 }), service({ tipo: 'CAPACIDAD', mbps: ' 50', plazoMeses: 24, viable: false })],
      }),
    );
    expect(payload).toEqual({
      cliente: 'Cliente Demo S.A.',
      servicios: [
        { tipo: 'INTERNET', mbps: 100, plazoMeses: 36, viable: true },
        { tipo: 'CAPACIDAD', mbps: 50, plazoMeses: 24, viable: false },
      ],
    });
  });
});
