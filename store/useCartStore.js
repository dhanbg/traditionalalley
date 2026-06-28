import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Helper to generate unique cart item ID
export const generateCartItemId = (productId, size, variantId) => {
    let id = productId;
    if (variantId) {
        id += `-variant-${variantId}`;
    }
    if (size) {
        id += `-size-${size}`;
    }
    return id;
};

export const useCartStore = create(
    persist(
        (set, get) => ({
            cartProducts: [],
            selectedCartItems: {},
            isCartLoading: false,
            cartLoadedOnce: false,

            setCartLoading: (loading) => set({ isCartLoading: loading }),
            setCartLoadedOnce: (loaded) => set({ cartLoadedOnce: loaded }),

            setCartProducts: (products) => {
                const selected = { ...get().selectedCartItems };
                products.forEach(item => {
                    if (!(item.id in selected)) {
                        selected[item.id] = true;
                    }
                });
                set({ cartProducts: products, selectedCartItems: selected, cartLoadedOnce: true });
            },

            addProductToCart: (productToAdd) => {
                const { cartProducts, selectedCartItems } = get();
                const existingIndex = cartProducts.findIndex(item => item.id === productToAdd.id);

                if (existingIndex > -1) {
                    // Update existing item quantity
                    const updated = [...cartProducts];
                    updated[existingIndex] = {
                        ...updated[existingIndex],
                        quantity: updated[existingIndex].quantity + (productToAdd.quantity || 1)
                    };
                    set({ cartProducts: updated });
                } else {
                    // Add new item & auto-select it
                    set({
                        cartProducts: [...cartProducts, productToAdd],
                        selectedCartItems: { ...selectedCartItems, [productToAdd.id]: true }
                    });
                }
            },

            removeCartItem: (id) => {
                const { cartProducts, selectedCartItems } = get();
                const newSelected = { ...selectedCartItems };
                delete newSelected[id];
                set({
                    cartProducts: cartProducts.filter(item => item.id !== id),
                    selectedCartItems: newSelected
                });
            },

            updateQuantity: (id, quantity) => {
                const { cartProducts } = get();
                const newQty = Math.max(1, quantity);
                set({
                    cartProducts: cartProducts.map(item =>
                        item.id === id ? { ...item, quantity: newQty } : item
                    )
                });
            },

            increaseQuantity: (id) => {
                const { cartProducts } = get();
                set({
                    cartProducts: cartProducts.map(item =>
                        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
                    )
                });
            },

            decreaseQuantity: (id) => {
                const { cartProducts } = get();
                set({
                    cartProducts: cartProducts.map(item =>
                        item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
                    )
                });
            },

            toggleCartItemSelection: (id) => {
                const { selectedCartItems, cartProducts } = get();
                const currentStatus = selectedCartItems[id] !== undefined
                    ? selectedCartItems[id]
                    : true;
                set({
                    selectedCartItems: {
                        ...selectedCartItems,
                        [id]: !currentStatus
                    }
                });
            },

            selectAllCartItems: (selectAll = true) => {
                const { cartProducts } = get();
                const newSelection = {};
                cartProducts.forEach(product => {
                    newSelection[product.id] = selectAll;
                });
                set({ selectedCartItems: newSelection });
            },

            clearCart: () => set({ cartProducts: [], selectedCartItems: {} }),

            // Getters / Selectors
            getTotalPrice: () => {
                return get().cartProducts.reduce((acc, item) => acc + (parseFloat(item.price || 0) * item.quantity), 0);
            },

            getSelectedCartItems: () => {
                const { cartProducts, selectedCartItems } = get();
                return cartProducts.filter(item => selectedCartItems[item.id] !== false);
            },

            getSelectedItemsTotal: () => {
                const selected = get().getSelectedCartItems();
                return selected.reduce((acc, item) => acc + (parseFloat(item.price || 0) * item.quantity), 0);
            },

            isAddedToCartProducts: (id) => {
                if (!id) return false;
                return get().cartProducts.some(item => item.id === id);
            },

            isProductSizeInCart: (productDocumentId, selectedSize, variantId = null) => {
                if (!productDocumentId || !selectedSize) return false;
                return get().cartProducts.some(cartItem => {
                    const productMatches = cartItem.documentId === productDocumentId || cartItem.baseProductId === productDocumentId;
                    const sizeMatches = cartItem.selectedSize === selectedSize;
                    let variantMatches = true;
                    if (variantId) {
                        variantMatches = cartItem.variantInfo?.variantId === variantId;
                    } else {
                        variantMatches = !cartItem.variantInfo || !cartItem.variantInfo.isVariant;
                    }
                    return productMatches && sizeMatches && variantMatches;
                });
            }
        }),
        {
            name: 'guest-cart-storage',
            storage: createJSONStorage(() => (typeof window !== 'undefined' ? sessionStorage : null)),
            partialize: (state) => ({
                cartProducts: state.cartProducts,
                selectedCartItems: state.selectedCartItems
            }),
        }
    )
);
