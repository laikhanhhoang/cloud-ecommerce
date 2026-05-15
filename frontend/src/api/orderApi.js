import { httpClient } from './httpClient';
import { normalizeApiError } from './apiError';

export async function createOrder(payload) {
  try {
    const response = await httpClient.post('/api/orders/create/', payload);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function fetchOrderHistory(params = {}) {
  try {
    const response = await httpClient.get('/api/orders/history/', { params });
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function fetchOrderDetail(id) {
  try {
    const response = await httpClient.get(`/api/orders/${id}/`);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
