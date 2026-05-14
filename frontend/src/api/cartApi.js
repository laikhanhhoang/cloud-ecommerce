import { httpClient } from './httpClient';

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
 * GET /api/cart/
 * Note: backend returns 200 with { message } when user has no cart.
 */
export async function fetchCart() {
  const response = await httpClient.get('/api/cart/');
  return normalizeCart(response.data);
}

/**
 * GET /api/cart/count/
 * @returns {{count: number}}
 */
export async function fetchCartCount() {
  const response = await httpClient.get('/api/cart/count/');
  const count = Number(response.data?.count ?? 0);
  return { ...response.data, count: Number.isFinite(count) ? count : 0 };
}

/**
 * POST /api/cart/items/
 * @param {{product_variant_id: number, quantity?: number}} payload
 */
export async function addCartItem(payload) {
  const response = await httpClient.post('/api/cart/items/', payload);
  const data = response.data;

  if (isPlainObject(data) && isPlainObject(data.data)) {
    return { ...data, data: normalizeCart(data.data) };
  }

  return data;
}

/**
 * PATCH /api/cart/items/{item_id}/
 * @param {number|string} itemId
 * @param {{quantity: number}} payload
 */
export async function updateCartItemQuantity(itemId, payload) {
  const response = await httpClient.patch(`/api/cart/items/${itemId}/`, payload);
  const data = response.data;

  if (isPlainObject(data) && isPlainObject(data.data)) {
    return { ...data, data: normalizeCart(data.data) };
  }

  return data;
}

/**
 * DELETE /api/cart/items/{item_id}/
 * @param {number|string} itemId
 */
export async function removeCartItem(itemId) {
  const response = await httpClient.delete(`/api/cart/items/${itemId}/`);
  const data = response.data;

  if (isPlainObject(data) && isPlainObject(data.data)) {
    return { ...data, data: normalizeCart(data.data) };
  }

  return data;
}
