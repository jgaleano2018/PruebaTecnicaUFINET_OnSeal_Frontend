import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';
import { ApiError, NETWORK_ERROR_MESSAGE, toApiError, UNEXPECTED_ERROR_MESSAGE } from './apiError';

function axiosErrorWithResponse(status: number, data: unknown): AxiosError {
  const config = { headers: new AxiosHeaders() };
  const response = { status, data, statusText: '', headers: {}, config } as AxiosResponse;
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, {}, response);
}

describe('toApiError', () => {
  it('convierte un ProblemDetail 400 con errores de campo', () => {
    const error = toApiError(
      axiosErrorWithResponse(400, {
        title: 'Solicitud inválida',
        status: 400,
        detail: 'La solicitud contiene errores de validación',
        code: 'VALIDATION_ERROR',
        errors: [{ field: 'cliente', message: 'El cliente es obligatorio' }],
      }),
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe('La solicitud contiene errores de validación');
    expect(error.status).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.title).toBe('Solicitud inválida');
    expect(error.fieldErrors).toEqual([{ field: 'cliente', message: 'El cliente es obligatorio' }]);
    expect(error.isValidationError).toBe(true);
    expect(error.isNotFound).toBe(false);
    expect(error.isConflict).toBe(false);
    expect(error.isNetworkError).toBe(false);
  });

  it('convierte 404 y 409', () => {
    expect(toApiError(axiosErrorWithResponse(404, { detail: 'No existe una oferta con id 9' })).isNotFound).toBe(true);
    const conflict = toApiError(axiosErrorWithResponse(409, { title: 'Estado de la oferta no válido' }));
    expect(conflict.isConflict).toBe(true);
    expect(conflict.message).toBe('Estado de la oferta no válido');
    expect(conflict.fieldErrors).toEqual([]);
  });

  it('usa un mensaje genérico si la respuesta no es ProblemDetail', () => {
    const error = toApiError(axiosErrorWithResponse(502, '<html>Bad gateway</html>'));
    expect(error.message).toBe('La API respondió con el estado 502.');
    expect(error.status).toBe(502);
  });

  it('usa el mensaje genérico si el ProblemDetail no trae detalle ni título', () => {
    expect(toApiError(axiosErrorWithResponse(500, { detail: undefined })).message).toBe(UNEXPECTED_ERROR_MESSAGE);
  });

  it('detecta que la API no responde (error de red)', () => {
    const error = toApiError(new AxiosError('Network Error', 'ERR_NETWORK'));
    expect(error.isNetworkError).toBe(true);
    expect(error.message).toBe(NETWORK_ERROR_MESSAGE);
    expect(error.status).toBeUndefined();
  });

  it('devuelve el mismo ApiError y envuelve errores desconocidos', () => {
    const original = new ApiError({ message: 'x' });
    expect(toApiError(original)).toBe(original);
    expect(toApiError(new Error('boom')).message).toBe(UNEXPECTED_ERROR_MESSAGE);
  });
});
