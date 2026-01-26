"use client";

// This file provides a wrapper around Redux hooks for backward compatibility
// Components using useContextElement get access to Redux state

import { useCart as useReduxCart } from "@/hooks/useCart";
import { useWishlist as useReduxWishlist } from "@/hooks/useWishlist";
import { useCurrency as useReduxCurrency } from "@/hooks/useCurrency";
import { useSession } from "next-auth/react";
import { useState, useEffect, useMemo } from "react";


export const useReduxContext = () => {
    const { data: session } = useSession();
    const user = session?.user;

    // Get Redux state and actions
    const cart = useReduxCart();
    const wishlist = useReduxWishlist();
    const currency = useReduxCurrency();

    // Maintain compareItem state locally (not migrated to Redux yet)
    const [compareItem, setCompareItem] = useState([]);

    // Load compare items from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('compareItems');
                if (saved) {
                    setCompareItem(JSON.parse(saved));
                }
            } catch (error) {
                console.error('Error loading compare items:', error);
            }
        }
    }, []);

    // Persist compare items
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('compareItems', JSON.stringify(compareItem));
        }
    }, [compareItem]);

    const addToCompareItem = (id) => {
        if (!compareItem.includes(id)) {
            setCompareItem([...compareItem, id]);
        }
    };

    const isAddedtoCompareItem = (id) => {
        return compareItem.includes(id);
    };

    const removeFromCompareItem = (id) => {
        setCompareItem(compareItem.filter(item => item !== id));
    };

    // Return combined API - memoize to prevent recreating on every render
    return useMemo(() => ({
        // Cart (from Redux)
        cartProducts: cart.cartProducts,
        addProductToCart: cart.addProductToCart,
        removeCartItem: cart.removeCartItem,
        removeFromCart: cart.removeCartItem, // Alias for compatibility
        increaseQuantity: cart.increaseQuantity,
        decreaseQuantity: cart.decreaseQuantity,
        updateQuantity: cart.updateQuantity,
        toggleCartItemSelection: cart.toggleCartItemSelection,
        selectAllCartItems: cart.selectAllCartItems,
        clearCart: cart.clearCart,
        getSelectedCartItems: cart.getSelectedCartItems,
        getSelectedItemsTotal: cart.getSelectedItemsTotal,
        isAddedToCartProducts: cart.isAddedToCartProducts,
        isProductSizeInCart: cart.isProductSizeInCart,
        selectedCartItems: cart.selectedCartItems,
        totalPrice: cart.totalPrice,
        isCartLoading: cart.isCartLoading,

        // Legacy compatibility - not used in Redux but needed for components
        setCartProducts: () => console.warn('setCartProducts is deprecated - use Redux actions'),
        cartRefreshKey: 0, // No longer needed with Redux
        isCartClearing: false,
        cartClearedTimestamp: null,
        cartLoadedOnce: true, // Assume cart is always loaded with Redux

        // Wishlist (from Redux)
        wishList: wishlist.wishList,
        addToWishlist: wishlist.addToWishlist,
        removeFromWishlist: wishlist.removeFromWishlist,
        toggleWishlist: wishlist.toggleWishlist,
        isAddedtoWishlist: wishlist.isInWishlist,

        // Currency (from Redux)
        userCurrency: currency.userCurrency,
        userCountry: currency.userCountry,
        exchangeRate: currency.exchangeRate,
        isLoadingCurrency: currency.isLoadingCurrency,
        setCurrency: currency.setCurrency,

        // Compare (local state)
        compareItem,
        addToCompareItem,
        isAddedtoCompareItem,
        removeFromCompareItem,
        setCompareItem,

        // User (from session)
        user,
    }), [cart, wishlist, currency, compareItem, user]);
};
