'use client';

import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
    selectWishlistItems,
    selectIsInWishlist,
    selectWishlistCount,
    addToWishlist as addToWishlistAction,
    removeFromWishlist as removeFromWishlistAction,
    toggleWishlist as toggleWishlistAction,
    loadWishlistFromBackend,
    addToWishlistInBackend,
    removeFromWishlistInBackend,
} from '@/store/slices/wishlistSlice';

export const useWishlist = () => {
    const dispatch = useDispatch();
    const { data: session } = useSession();
    const user = session?.user;
    const initialized = useRef(false);

    const wishList = useSelector(selectWishlistItems);
    const wishlistCount = useSelector(selectWishlistCount);

    // Load wishlist from backend when user logs in (only once)
    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            if (user?.id) {
                dispatch(loadWishlistFromBackend(user.id));
            } else {
                // For guests, load from localStorage
                if (typeof window !== 'undefined') {
                    try {
                        const savedWishlist = localStorage.getItem('guestWishlist');
                        if (savedWishlist) {
                            const items = JSON.parse(savedWishlist);
                            items.forEach(id => {
                                dispatch(addToWishlistAction({ productId: id }));
                            });
                        }
                    } catch (error) {
                        console.error('Error loading guest wishlist:', error);
                    }
                }
            }
        }
    }, [user?.id, dispatch]);

    // Persist guest wishlist to localStorage
    useEffect(() => {
        if (!user && typeof window !== 'undefined') {
            try {
                localStorage.setItem('guestWishlist', JSON.stringify(wishList));
            } catch (error) {
                console.error('Error saving guest wishlist:', error);
            }
        }
    }, [wishList, user]);

    const addToWishlist = useCallback((productId) => {
        dispatch(addToWishlistAction({ productId }));

        if (user?.id) {
            dispatch(addToWishlistInBackend({ userId: user.id, productId }));
        }
    }, [dispatch, user]);

    const removeFromWishlist = useCallback((productId) => {
        dispatch(removeFromWishlistAction({ productId }));

        if (user?.id) {
            dispatch(removeFromWishlistInBackend({ userId: user.id, productId }));
        }
    }, [dispatch, user]);

    const toggleWishlist = useCallback((productId) => {
        dispatch(toggleWishlistAction({ productId }));

        const isInWishlist = wishList.includes(productId);

        if (user?.id) {
            if (isInWishlist) {
                dispatch(removeFromWishlistInBackend({ userId: user.id, productId }));
            } else {
                dispatch(addToWishlistInBackend({ userId: user.id, productId }));
            }
        }
    }, [dispatch, user, wishList]);

    const isInWishlist = useCallback((productId) => {
        return wishList.includes(productId);
    }, [wishList]);

    return {
        wishList,
        wishlistCount,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
    };
};
