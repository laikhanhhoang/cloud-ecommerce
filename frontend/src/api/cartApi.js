import { httpClient } from './httpClient';
import { normalizeApiError } from './apiError';

const parseDecimalNumber = (value) => {
  if (value === null || value === undefined) return 0;
  const numeric = Number(String(value).replace(/,/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
};

const isPlainObject = (value) => {
  if (!value || typeof value !== 'object') return false;
  return Object.prototype.toString.call(value) === '[object Object]';
};

const normalizeCartItem = (item) => {
  if (!isPlainObject(item)) return item;

  return {
    ...item,
    unitPrice: parseDecimalNumber(item.unit_price),
    lineTotal: parseDecimalNumber(item.line_total),
  };
};

const normalizeCart = (cart) => {
  // Backend may return { message: "..." } when user has no cart.
  if (!isPlainObject(cart)) return cart;
  if (typeof cart.message === 'string') return cart;

  const items = Array.isArray(cart.items) ? cart.items.map(normalizeCartItem) : cart.items;

  return {
    ...cart,
    totalAmount: parseDecimalNumber(cart.total_amount),
    items,
  };
};

/**
 * GET /api/carts/
 * Note: backend returns 200 with { message } when user has no cart.
 */
export async function fetchCart() {
  try {
    const response = await httpClient.get('/api/carts/');
    return normalizeCart(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

/**
 * GET /api/carts/count/
 * @returns {{cart_count: number}}
 */
export async function fetchCartCount() {
  try {
    const response = await httpClient.get('/api/carts/count/');
    const count = Number(response.data?.cart_count ?? 0);
    return { ...response.data, cart_count: Number.isFinite(count) ? count : 0 };
  } catch (error) {
    throw normalizeApiError(error);
  }
}

/**
 * POST /api/carts/add/
 * @param {{product_variant_id: number, quantity?: number}} payload
 */
export async function addCartItem(payload) {
  try {
    const response = await httpClient.post('/api/carts/add/', payload);
    const data = response.data;

    if (isPlainObject(data) && isPlainObject(data.data)) {
      return { ...data, data: normalizeCart(data.data) };
    }

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

/**
 * PATCH /api/carts/items/{item_id}/
 * @param {number|string} itemId
 * @param {{quantity: number}} payload
 */
export async function updateCartItemQuantity(itemId, payload) {
  try {
    const response = await httpClient.patch(`/api/carts/items/${itemId}/`, payload);
    const data = response.data;

    if (isPlainObject(data) && isPlainObject(data.data)) {
      return { ...data, data: normalizeCart(data.data) };
    }

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

/**
 * DELETE /api/carts/items/{item_id}/
 * @param {number|string} itemId
 */
export async function removeCartItem(itemId) {
  try {
    const response = await httpClient.delete(`/api/carts/items/${itemId}/`);
    const data = response.data;

    if (isPlainObject(data) && isPlainObject(data.data)) {
      return { ...data, data: normalizeCart(data.data) };
    }

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
