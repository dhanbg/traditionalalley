import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useWishlistStore = create(
    persist(
        (set, get) => ({
            wishList: [],
            isWishlistLoading: false,

            setWishList: (list) => set({ wishList: list }),
            setWishlistLoading: (loading) => set({ isWishlistLoading: loading }),

            addToWishlist: (product) => {
                const { wishList } = get();
                const id = product.documentId || product.id;
                if (!wishList.some(item => (item.documentId || item.id) === id)) {
                    set({ wishList: [...wishList, product] });
                }
            },

            removeFromWishlist: (id) => {
                const { wishList } = get();
                set({
                    wishList: wishList.filter(item => (item.documentId || item.id) !== id && item.id !== id)
                });
            },

            toggleWishlist: (product) => {
                const { wishList, addToWishlist, removeFromWishlist } = get();
                const id = product.documentId || product.id;
                if (wishList.some(item => (item.documentId || item.id) === id || item.id === id)) {
                    removeFromWishlist(id);
                } else {
                    addToWishlist(product);
                }
            },

            isInWishlist: (id) => {
                if (!id) return false;
                return get().wishList.some(item => (item.documentId || item.id) === id || item.id === id);
            }
        }),
        {
            name: 'guest-wishlist-storage',
            storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : null)),
        }
    )
);
