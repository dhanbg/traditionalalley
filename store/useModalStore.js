import { create } from 'zustand';

export const useModalStore = create((set) => ({
    isCartModalOpen: false,
    isWishlistModalOpen: false,
    isSearchModalOpen: false,
    isQuickViewOpen: false,

    openCartModal: () => set({ isCartModalOpen: true }),
    closeCartModal: () => set({ isCartModalOpen: false }),
    toggleCartModal: () => set((state) => ({ isCartModalOpen: !state.isCartModalOpen })),

    openWishlistModal: () => set({ isWishlistModalOpen: true }),
    closeWishlistModal: () => set({ isWishlistModalOpen: false }),
    toggleWishlistModal: () => set((state) => ({ isWishlistModalOpen: !state.isWishlistModalOpen })),
}));
