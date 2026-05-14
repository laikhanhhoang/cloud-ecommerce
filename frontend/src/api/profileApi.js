import { httpClient } from './httpClient';

const isBlobLike = (value) =>
  typeof Blob !== 'undefined' && value instanceof Blob;

/**
 * GET /api/profile/me/
 */
export async function fetchProfile() {
  const response = await httpClient.get('/api/profile/me/');
  return response.data;
}

/**
 * PATCH /api/profile/me/
 * Supports JSON or multipart/form-data (when avatar is File/Blob)
 *
 * @param {Object} payload
 * @param {string=} payload.full_name
 * @param {string=} payload.phone_number
 * @param {File|Blob|null=} payload.avatar
 */
export async function updateProfile(payload = {}) {
  const { full_name, phone_number, avatar } = payload;

  const hasAvatarFile = isBlobLike(avatar);

  if (hasAvatarFile) {
    const formData = new FormData();

    if (typeof full_name === 'string') formData.append('full_name', full_name);
    if (typeof phone_number === 'string') formData.append('phone_number', phone_number);
    formData.append('avatar', avatar);

    const response = await httpClient.patch('/api/profile/me/', formData);
    return response.data;
  }

  const jsonPayload = {};
  if (typeof full_name === 'string') jsonPayload.full_name = full_name;
  if (typeof phone_number === 'string') jsonPayload.phone_number = phone_number;

  const response = await httpClient.patch('/api/profile/me/', jsonPayload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
}
