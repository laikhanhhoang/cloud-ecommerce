import React, { useMemo, useState } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { buildCartKey, getDefaultVariant, getPrimaryImageValue, parsePriceNumber } from '../../utils/productVariantUtils';
import ProductGallery from './ProductGallery';
import VariantSelector from './VariantSelector';
import ProductDescriptionSection from './ProductDescriptionSection';
import ProductSpecsTable from './ProductSpecsTable';

const EMPTY_ARRAY = Object.freeze([]);

export default function ProductDetailContent({ product, onAddToCart, onBuyNow }) {
  const variants = product?.variants;
  const rawOptionVersions = product?.options?.version;
  const rawOptionColors = product?.options?.color;

  const optionVersions = Array.isArray(rawOptionVersions) ? rawOptionVersions : null;
  const optionColors = Array.isArray(rawOptionColors) ? rawOptionColors : null;
  const safeVariants = Array.isArray(variants) ? variants : EMPTY_ARRAY;
  const canSelectVariants = safeVariants.length > 0 && optionVersions && optionColors;

  const defaultVariant = useMemo(
    () => getDefaultVariant({ variants: safeVariants, optionVersions, optionColors }),
    [safeVariants, optionVersions, optionColors]
  );

  const [selectedVersion, setSelectedVersion] = useState(() => {
    if (!canSelectVariants) return null;
    return defaultVariant?.version ?? optionVersions?.[0] ?? null;
  });

  const [selectedColor, setSelectedColor] = useState(() => {
    if (!canSelectVariants) return null;
    return defaultVariant?.color ?? optionColors?.[0] ?? null;
  });

  const [activeThumbnail, setActiveThumbnail] = useState(null);

  const selectedVariant = useMemo(() => {
    if (!canSelectVariants) return null;
    return (
      safeVariants.find((variant) => variant?.version === selectedVersion && variant?.color === selectedColor) || null
    );
  }, [canSelectVariants, safeVariants, selectedVersion, selectedColor]);

  const handleSelectVersion = (nextVersion) => {
    if (!canSelectVariants) return;
    setSelectedVersion(nextVersion);
    setActiveThumbnail(null);
  };

  const handleSelectColor = (nextColor) => {
    if (!canSelectVariants) return;
    setSelectedColor(nextColor);
    setActiveThumbnail(null);
  };

  const displayPriceString = selectedVariant?.price ?? product?.base_price;
  const unitPrice = parsePriceNumber(displayPriceString);

  const buildCartItem = () => {
    const productId = product?.id;
    const variantId = selectedVariant?.id ?? null;
    const selectedVariantImage = selectedVariant?.variant_image?.image ?? null;

    const imageValue =
      selectedVariantImage || activeThumbnail || product?.main_image || getPrimaryImageValue(product);

    const cartKey = buildCartKey({ productId, variantId });

    return {
      cartKey,
      id: productId,
      productId,
      variantId,
      name: product?.name,
      version: selectedVariant?.version ?? selectedVersion ?? null,
      color: selectedVariant?.color ?? selectedColor ?? null,
      main_image: imageValue,
      unitPrice,
      price: unitPrice,
      quantity: 1
    };
  };

  const handleAddToCart = () => {
    if (!product) return;
    onAddToCart?.(buildCartItem());
  };

  const handleBuyNow = () => {
    if (!product) return;
    onBuyNow?.(buildCartItem());
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        <ProductGallery
          images={product.images}
          productMainImage={product.main_image}
          selectedVariantImage={selectedVariant?.variant_image?.image ?? null}
          activeThumbnail={activeThumbnail}
          onThumbnailSelect={setActiveThumbnail}
          alt={product.name}
        />

        <div className="w-full md:w-1/2 flex flex-col py-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
          <p className="text-2xl font-semibold text-red-600 mb-6">{formatCurrency(unitPrice)}</p>

          {canSelectVariants && (
            <div className="mb-8">
              <VariantSelector
                versions={optionVersions}
                colors={optionColors}
                selectedVersion={selectedVersion}
                selectedColor={selectedColor}
                onSelectVersion={handleSelectVersion}
                onSelectColor={handleSelectColor}
              />
            </div>
          )}

          <div className="flex flex-col gap-4 mt-auto md:mt-0">
            <button
              onClick={handleAddToCart}
              className="w-full py-3 px-6 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 font-medium transition"
            >
              Thêm vào giỏ
            </button>
            <button
              onClick={handleBuyNow}
              className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition"
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>

      <ProductDescriptionSection description={product?.description} />
      <ProductSpecsTable specs={product?.specs} />
    </div>
  );
}
