const EMPTY_ARRAY = Object.freeze([]);

export const parsePriceNumber = (value) => {
  const numeric = Number(String(value ?? 0).replace(/,/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
};

export const getPrimaryImageValue = (product) => {
  if (!product) return null;

  const images = Array.isArray(product.images) ? product.images : EMPTY_ARRAY;
  const mainImage = images.find((img) => img?.is_main && img?.image)?.image;
  const firstImage = images.find((img) => img?.image)?.image;

  return mainImage || firstImage || product.main_image || null;
};

export const getDefaultVariant = ({ variants, optionVersions, optionColors }) => {
  const safeVariants = Array.isArray(variants) ? variants : EMPTY_ARRAY;
  if (safeVariants.length === 0) return null;
  if (!Array.isArray(optionVersions) || !Array.isArray(optionColors)) return null;

  const normalizeValue = (value) => (value === null || value === undefined ? null : String(value));
  const getStockScore = (variant) => {
    const stockNumber = Number(variant?.stock);
    return Number.isFinite(stockNumber) && stockNumber > 0 ? 1 : 0;
  };

  const isValidVariant = (variant) => {
    if (!variant) return false;
    if (!variant.version) return false;
    if (!variant.price) return false;
    return true;
  };

  const isAllowedByOptions = (variant) => {
    const versionValue = normalizeValue(variant?.version);
    const colorValue = normalizeValue(variant?.color);
    return optionVersions.includes(versionValue) && optionColors.includes(colorValue);
  };

  const candidates = safeVariants.filter(isValidVariant).filter(isAllowedByOptions);
  const sortedCandidates = [...candidates].sort((a, b) => getStockScore(b) - getStockScore(a));

  return sortedCandidates[0] || candidates[0] || safeVariants[0] || null;
};

export const buildCartKey = ({ productId, variantId }) => {
  return `${String(productId)}:${variantId === null || variantId === undefined ? 'base' : String(variantId)}`;
};
