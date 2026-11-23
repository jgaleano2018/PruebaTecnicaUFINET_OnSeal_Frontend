import { isAxiosError } from 'axios';

/** Error de un campo tal como lo devuelve el backend (ProblemDetail.errors[]). */
export interface FieldError {
  field: string;
  message: string;
}

/** Cuerpo de error ProblemDetail (RFC 9457) devuelto por la API. */
export interface ProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  code?: string;
  timestamp?: string;
  errors?: FieldError[];
}

export const NETWORK_ERROR_MESSAGE =
  'No se pudo conectar con la API. Verifica que el backend esté en ejecución e intenta de nuevo.';
export const UNEXPECTED_ERROR_MESSAGE = 'Ocurrió un error inesperado. Intenta de nuevo.';

/** Error normalizado que consume la capa de presentación. */
export class ApiError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly title?: string;
  readonly fieldErrors: FieldError[];
  readonly isNetworkError: boolean;

  constructor(params: {
    message: string;
    status?: number;
    code?: string;
    title?: string;
    fieldErrors?: FieldError[];
    isNetworkError?: boolean;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.status = params.status;
    this.code = params.code;
    this.title = params.title;
    this.fieldErrors = params.fieldErrors ?? [];
    this.isNetworkError = params.isNetworkError ?? false;
  }

  get isValidationError(): boolean {
    return this.status === 400;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isConflict(): boolean {
    return this.status === 409;
  }
}

function isProblemDetail(value: unknown): value is ProblemDetail {
  return typeof value === 'object' && value !== null && ('detail' in value || 'title' in value);
}

/** Convierte cualquier error (axios, red, desconocido) en un ApiError con mensaje claro. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  if (isAxiosError(error)) {
    if (!error.response) {
      return new ApiError({ message: NETWORK_ERROR_MESSAGE, isNetworkError: true });
    }
    const { status, data } = error.response;
    if (isProblemDetail(data)) {
      return new ApiError({
        message: data.detail ?? data.title ?? UNEXPECTED_ERROR_MESSAGE,
        status,
        code: data.code,
        title: data.title,
        fieldErrors: Array.isArray(data.errors) ? data.errors : [],
      });
    }
    return new ApiError({ message: `La API respondió con el estado ${status}.`, status });
  }
  return new ApiError({ message: UNEXPECTED_ERROR_MESSAGE });
}
