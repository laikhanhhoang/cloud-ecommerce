import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const DEBUG = import.meta.env.VITE_DEBUG === 'True';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

if (DEBUG) {
  console.log("Check API URL:", import.meta.env.VITE_API_BASE_URL);
}

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
});

let refreshPromise = null;

const isRefreshRequest = (config) => {
  const url = config?.url || '';
  return url.includes('/api/auth/token/refresh/');
};

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error?.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (status !== 401) {
      return Promise.reject(error);
    }

    if (isRefreshRequest(originalRequest)) {
      useAuthStore.getState().clearUser();
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = httpClient
          .post('/api/auth/token/refresh/')
          .finally(() => {
            refreshPromise = null;
          });
      }

      await refreshPromise;
      return httpClient(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().clearUser();
      return Promise.reject(refreshError);
    }
  },
);
