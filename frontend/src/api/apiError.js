const DEFAULT_MESSAGE = 'Có lỗi xảy ra. Vui lòng thử lại.';

const isPlainObject = (value) => {
  if (!value || typeof value !== 'object') return false;
  return Object.prototype.toString.call(value) === '[object Object]';
};

/**
 * Normalize backend errors into a consistent shape.
 * Works with both:
 * - DRF custom exception handler wrapper: { error: { status_code, message, details } }
 * - Manual errors: { error: "..." } or field errors: { phone_number: ["..."] }
 *
 * @param {any} err AxiosError-like
 */
export function normalizeApiError(err) {
  const statusCode = err?.response?.status;
  const data = err?.response?.data;

  // Wrapped format
  if (isPlainObject(data) && isPlainObject(data.error)) {
    const wrapped = data.error;
    return {
      statusCode: wrapped.status_code ?? statusCode,
      message: wrapped.message || DEFAULT_MESSAGE,
      details: wrapped.details ?? null,
      raw: data,
    };
  }

  // Manual error: { error: "..." }
  if (isPlainObject(data) && typeof data.error === 'string') {
    return {
      statusCode,
      message: data.error || DEFAULT_MESSAGE,
      details: null,
      raw: data,
    };
  }

  // Field errors object: { field: ["..."] }
  if (isPlainObject(data)) {
    return {
      statusCode,
      message: DEFAULT_MESSAGE,
      details: data,
      raw: data,
    };
  }

  return {
    statusCode,
    message: err?.message || DEFAULT_MESSAGE,
    details: null,
    raw: data ?? null,
  };
}

export function getErrorStatusCode(err) {
  return err?.response?.status;
}
