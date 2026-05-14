import { httpClient } from './httpClient';

/**
 * @typedef {Object} RegisterPayload
 * @property {string} email
 * @property {string=} username
 * @property {string} password
 * @property {string} password_confirm
 */

/**
 * @typedef {Object} LoginPayload
 * @property {string} email
 * @property {string} password
 */

export async function fetchCurrentUser() {
  const response = await httpClient.get('/api/auth/me/');
  return response.data;
}

/**
 * POST /api/auth/register/
 * @param {RegisterPayload} payload
 */
export async function register(payload) {
  const response = await httpClient.post('/api/auth/register/', payload);
  return response.data;
}

/**
 * POST /api/auth/login/
 * Note: backend may return 200 with only a message when already logged in.
 * @param {LoginPayload} payload
 */
export async function login(payload) {
  const response = await httpClient.post('/api/auth/login/', payload);
  return response.data;
}

/**
 * POST /api/auth/logout/
 */
export async function logout() {
  const response = await httpClient.post('/api/auth/logout/');
  return response.data;
}

/**
 * POST /api/auth/token/refresh/
 * (no body; refresh cookie is read by backend)
 */
export async function refreshToken() {
  const response = await httpClient.post('/api/auth/token/refresh/');
  return response.data;
}
