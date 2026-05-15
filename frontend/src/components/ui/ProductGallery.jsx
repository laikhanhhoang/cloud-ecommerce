import React from 'react';
import { resolveMediaUrl } from '../../utils/resolveMediaUrl';
import heroImage from '../../assets/hero.png';

const pickMainImageFromImages = (images) => {
  const safeImages = Array.isArray(images) ? images : [];
  const main = safeImages.find((img) => img?.is_main && img?.image)?.image;
  const first = safeImages.find((img) => img?.image)?.image;
  return main || first || null;
};

export default function ProductGallery({
  images,
  productMainImage,
  selectedVariantImage,
  activeThumbnail,
  onThumbnailSelect,
  alt,
}) {
  const baseFromImages = pickMainImageFromImages(images);

  const mainImageValue =
    selectedVariantImage ||
    activeThumbnail ||
    baseFromImages ||
    productMainImage ||
    null;

  const resolvedMainImage = resolveMediaUrl(mainImageValue) || heroImage;

  const safeImages = Array.isArray(images) ? images : [];

  return (
    <div className="w-full md:w-1/2 flex-shrink-0">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <img
          src={resolvedMainImage}
          alt={alt}
          className="w-full h-auto aspect-square object-cover"
        />
      </div>

      {safeImages.length > 0 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {safeImages.map((img) => {
            const thumbUrl = resolveMediaUrl(img?.image) || heroImage;
            const isActive = Boolean(activeThumbnail) && String(activeThumbnail) === String(img?.image);

            return (
              <button
                key={img?.id ?? img?.image}
                type="button"
                onClick={() => onThumbnailSelect?.(img?.image || null)}
                className={
                  isActive
                    ? 'w-16 h-16 flex-shrink-0 rounded-lg border-2 border-blue-600 overflow-hidden'
                    : 'w-16 h-16 flex-shrink-0 rounded-lg border border-gray-200 overflow-hidden hover:border-blue-300 transition'
                }
                aria-label="Chọn ảnh"
              >
                <img
                  src={thumbUrl}
                  alt={alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
