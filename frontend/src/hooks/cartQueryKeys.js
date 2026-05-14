/**
 * Centralized query keys for Cart-related React Query hooks.
 * Use functions to avoid accidental mutation of the arrays.
 */
export const cartQueryKeys = {
  cart: () => ['cart'],
  count: () => ['cart', 'count'],
};
