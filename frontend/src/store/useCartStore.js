import { create } from 'zustand';

const normalizeCount = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.floor(numeric));
};

const computeCountFromItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) return 0;
  return items.reduce((sum, item) => sum + normalizeCount(item?.quantity ?? 1), 0);
};

export const useCartStore = create((set) => ({
  // Legacy client-side cart (still used by current UI; will be migrated in Phase 9)
  items: [],

  // Bridge for server-side cart badge (Header subscribes to this in Task 9.4)
  cartCount: 0,
  setCartCount: (count) => set({ cartCount: normalizeCount(count) }),

  addToCart: (cartItem) => set((state) => {
    if (!cartItem) return state;

    const productId = cartItem.productId ?? cartItem.id;
    const variantId = cartItem.variantId ?? null;
    const cartKey = cartItem.cartKey ?? `${String(productId)}:${variantId === null ? 'base' : String(variantId)}`;

    const existingItem = state.items.find((item) => item.cartKey === cartKey);

    if (existingItem) {
      const nextItems = state.items.map((item) =>
        item.cartKey === cartKey
          ? { ...item, quantity: normalizeCount(item.quantity || 1) + 1 }
          : item
      );

      return {
        items: nextItems,
        cartCount: computeCountFromItems(nextItems),
      };
    }

    const normalizedQuantity = Number.isFinite(Number(cartItem.quantity)) ? Number(cartItem.quantity) : 1;
    const safeQuantity = normalizedQuantity > 0 ? normalizeCount(normalizedQuantity) : 1;

    const nextItems = [
      ...state.items,
      {
        ...cartItem,
        id: productId,
        productId,
        variantId,
        cartKey,
        quantity: safeQuantity,
      },
    ];

    return {
      items: nextItems,
      cartCount: computeCountFromItems(nextItems),
    };
  }),

  removeFromCart: (cartKey) => set((state) => {
    const nextItems = state.items.filter((item) => item.cartKey !== cartKey);
    return {
      items: nextItems,
      cartCount: computeCountFromItems(nextItems),
    };
  }),

  clearCart: () => set({ items: [], cartCount: 0 }),
}));
