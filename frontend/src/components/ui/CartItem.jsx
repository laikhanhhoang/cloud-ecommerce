import React, { useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { normalizeApiError } from '../../api/apiError';
import { resolveMediaUrl } from '../../utils/resolveMediaUrl';
import heroImage from '../../assets/hero.png';

const toSafeInt = (value, fallback = 1) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(1, Math.floor(numeric));
};

const CartItem = ({ item, onRemove, onUpdateQuantity, isRemoving, isUpdating, error, errorItemId }) => {
  const itemId = item?.id;
  const productVariant = item?.product_variant;
  const product = productVariant?.product;

  const imageUrl = resolveMediaUrl(product?.main_image) || heroImage;
  const name = product?.name ?? '';
  const quantity = toSafeInt(item?.quantity, 1);
  const unitPrice = typeof item?.unitPrice === 'number' && Number.isFinite(item.unitPrice)
    ? item.unitPrice
    : Number(String(item?.unit_price ?? 0).replace(/,/g, ''));
  const lineTotal = typeof item?.lineTotal === 'number' && Number.isFinite(item.lineTotal)
    ? item.lineTotal
    : Number(String(item?.line_total ?? 0).replace(/,/g, ''));

  const versionText = typeof productVariant?.version === 'string' ? productVariant.version.trim() : '';
  const colorText = typeof productVariant?.color === 'string' ? productVariant.color.trim() : '';
  const hasVariantInfo = Boolean(versionText) || Boolean(colorText);

  const [draftQuantity, setDraftQuantity] = useState(String(quantity));

  useEffect(() => {
    setDraftQuantity(String(quantity));
  }, [quantity]);

  const stockErrorText = useMemo(() => {
    if (!error) return null;
    if (errorItemId !== itemId) return null;

    const normalized = normalizeApiError(error);
    const details = normalized?.details;

    if (details && typeof details === 'object' && Array.isArray(details.quantity) && details.quantity.length > 0) {
      return String(details.quantity[0]);
    }

    return null;
  }, [error, errorItemId, itemId]);

  const commitQuantity = (nextQuantity) => {
    if (!itemId) return;
    const safeQuantity = toSafeInt(nextQuantity, quantity);
    if (safeQuantity === quantity) {
      setDraftQuantity(String(quantity));
      return;
    }
    onUpdateQuantity?.(itemId, safeQuantity);
  };

  const handleDecrease = () => {
    if (isUpdating) return;
    commitQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    if (isUpdating) return;
    commitQuantity(quantity + 1);
  };

  const handleInputBlur = () => {
    commitQuantity(draftQuantity);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitQuantity(draftQuantity);
    }
  };

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
      <img 
        src={imageUrl} 
        alt={name} 
        className="w-24 h-24 object-cover rounded-md border border-gray-100 flex-shrink-0" 
      />
      
      <div className="flex-1">
        <h3 className="font-medium text-gray-900 text-lg">{name}</h3>
        {hasVariantInfo && (
          <p className="text-sm text-gray-500 mt-1">
            {versionText ? `Phiên bản: ${versionText}` : null}
            {versionText && colorText ? ' • ' : null}
            {colorText ? `Màu: ${colorText}` : null}
          </p>
        )}

        <div className="mt-3 flex items-center gap-3">
          <span className="text-sm text-gray-500">Số lượng:</span>
          <div className="inline-flex items-center rounded-lg border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={handleDecrease}
              disabled={true}
              title="Chức năng đang cập nhật"
              className="px-3 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Giảm số lượng"
            >
              -
            </button>
            <input
              inputMode="numeric"
              value={draftQuantity}
              onChange={(e) => setDraftQuantity(e.target.value)}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              disabled={true}
              title="Chức năng đang cập nhật"
              className="w-14 text-center py-2 outline-none border-x border-gray-200 disabled:bg-gray-50 disabled:text-gray-500"
              aria-label="Số lượng"
            />
            <button
              type="button"
              onClick={handleIncrease}
              disabled={true}
              title="Chức năng đang cập nhật"
              className="px-3 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Tăng số lượng"
            >
              +
            </button>
          </div>
        </div>

        <div className="mt-2 text-[11px] text-orange-500 italic">
          * Tính năng thay đổi số lượng và xoá sản phẩm đang được bảo trì.
        </div>

        {stockErrorText && (
          <div className="mt-2 text-sm text-red-600">{stockErrorText}</div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <p className="text-red-600 font-semibold">{formatCurrency(unitPrice)}</p>
          <p className="text-sm text-gray-600">Thành tiền: <span className="font-semibold">{formatCurrency(lineTotal)}</span></p>
        </div>
      </div>

      <button 
        onClick={() => itemId && onRemove?.(itemId)}
        disabled={true}
        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Chức năng xoá đang cập nhật"
      >
        <Trash2 size={22} />
      </button>
    </div>
  );
};

export default CartItem;