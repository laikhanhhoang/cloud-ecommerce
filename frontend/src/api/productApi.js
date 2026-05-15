import { mockProducts } from './mockData';
import { httpClient } from './httpClient';

const DELAY_MS = 500;
const PAGE_SIZE = 20;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';
const useBackendProductsEnv = import.meta.env.VITE_USE_BACKEND_PRODUCTS_API;
const USE_BACKEND_PRODUCTS_API = useBackendProductsEnv !== undefined
  ? String(useBackendProductsEnv).toLowerCase() === 'true'
  : Boolean(API_BASE_URL || BACKEND_URL);

// Giả lập network delay
const delay = (ms = DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const parsePriceNumber = (value) => {
  if (value === null || value === undefined) return 0;
  const numeric = Number(String(value).replace(/,/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
};

const parseFilterNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : NaN;
};

const buildPageUrl = (page, filters) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;
    params.set(key, value);
  });

  params.set('page', page);
  return `/api/products/?${params.toString()}`;
};

/**
 * Lấy danh sách sản phẩm (Home, Search, Category)
 * @param {Object} params - Query Parameters ({ keyword, category, brand, min_price, max_price, page })
 */
export const fetchProducts = async (params = {}) => {
  if (USE_BACKEND_PRODUCTS_API) {
    const backendParams = Object.fromEntries(
      Object.entries({
        keyword: params.keyword || params.search,
        category: params.category,
        brand: params.brand,
        min_price: params.min_price,
        max_price: params.max_price,
        page: params.page,
      }).filter(([, value]) => value !== undefined && value !== null && value !== '')
    );

    const response = await httpClient.get('/api/products/', { params: backendParams });
    return response.data;
  }

  await delay();

  const keyword = normalizeText(params.keyword || params.search);
  const category = normalizeText(params.category);
  const brand = normalizeText(params.brand);
  const minPrice = parseFilterNumber(params.min_price);
  const maxPrice = parseFilterNumber(params.max_price);
  const pageNumber = Math.max(1, Number(params.page) || 1);

  if (Number.isNaN(minPrice)) {
    return Promise.reject({
      min_price: ['A valid number is required.']
    });
  }

  if (Number.isNaN(maxPrice)) {
    return Promise.reject({
      max_price: ['A valid number is required.']
    });
  }

  let filteredList = [...mockProducts];

  if (keyword) {
    filteredList = filteredList.filter((product) =>
      normalizeText(product.name).includes(keyword)
    );
  }

  if (category) {
    filteredList = filteredList.filter((product) =>
      normalizeText(product.category).includes(category)
    );
  }

  if (brand) {
    filteredList = filteredList.filter((product) =>
      normalizeText(product.brand).includes(brand)
    );
  }

  if (minPrice !== null) {
    filteredList = filteredList.filter((product) =>
      parsePriceNumber(product.base_price ?? product.price) >= minPrice
    );
  }

  if (maxPrice !== null) {
    filteredList = filteredList.filter((product) =>
      parsePriceNumber(product.base_price ?? product.price) <= maxPrice
    );
  }


  const count = filteredList.length;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const startIndex = (pageNumber - 1) * PAGE_SIZE;
  const results = filteredList.slice(startIndex, startIndex + PAGE_SIZE);

  const filterParams = {
    keyword: params.keyword || params.search,
    category: params.category,
    brand: params.brand,
    min_price: params.min_price,
    max_price: params.max_price
  };

  const next = pageNumber < totalPages
    ? buildPageUrl(pageNumber + 1, filterParams)
    : null;
  const previous = pageNumber > 1
    ? buildPageUrl(pageNumber - 1, filterParams)
    : null;

  return {
    count,
    next,
    previous,
    results
  };
};

/**
 * Lấy chi tiết một sản phẩm
 * @param {string} id - Mã sản phẩm
 */
export const fetchProductById = async (id) => {
  if (USE_BACKEND_PRODUCTS_API) {
    const response = await httpClient.get(`/api/products/${id}/`);
    return response.data;
  }

  await delay();

  const foundProduct = mockProducts.find((product) => String(product.id) === String(id));

  if (!foundProduct) {
    return Promise.reject({
      error: 'Không tìm thấy sản phẩm này.'
    });
  }

  return foundProduct;
};

/**
 * Gửi đơn hàng (Checkout)
 * @param {Object} orderData - Dữ liệu đặt hàng
 */
export const submitOrder = async (orderData) => {
  await delay();

  void orderData;
  
  // Trả về mock schema của Submit Order API
  const orderId = `ORD_${Math.floor(100000 + Math.random() * 900000)}`;

  return {
    success: true,
    message: 'Thanh toán thành công',
    orderId
  };
};
