import { create } from 'zustand';

export const useWishlistStore = create(() => ({
    wishList: [],
    isWishlistLoading: false,
    setWishList: () => {},
    setWishlistLoading: () => {},
    addToWishlist: () => {},
    removeFromWishlist: () => {},
    toggleWishlist: () => {},
    isInWishlist: () => false
}));
