'use client';

export const useWishlist = () => {
    return {
        wishList: [],
        wishlistCount: 0,
        addToWishlist: () => {},
        removeFromWishlist: () => {},
        toggleWishlist: () => {},
        isInWishlist: () => false,
    };
};
