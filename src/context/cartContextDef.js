import { createContext } from 'react';

/**
 * Shared Cart React Context definition.
 * Kept in a dedicated module so CartProvider and useCart can import it
 * without triggering React Fast Refresh "only-export-components" warnings.
 */
export const CartContext = createContext(null);
export default CartContext;
