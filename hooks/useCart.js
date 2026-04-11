'use client';

import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { allProducts } from '@/data/productsWomen';
import { getImageUrl } from '@/utils/imageUtils';
import { validateCartStock } from '@/utils/stockValidation';
import { useStockNotifications } from '@/components/common/StockNotification';
import { openCartModal } from '@/utils/openCartModal';
import {
    selectCartItems,
    selectSelectedItems,
    selectTotalPrice,
    selectIsCartLoading,
    selectSelectedCartItems,
    selectSelectedItemsTotal,
    addProductToCart as addProductAction,
    removeProductFromCart,
    increaseQuantity as increaseQty,
    decreaseQuantity as decreaseQty,
    updateQuantity as updateQty,
    toggleItemSelection,
    selectAllItems,
    clearCart as clearCartAction,
    loadCartFromBackend,
    syncCartItemToBackend,
    removeCartItemFromBackend,
    updateCartItemQuantityInBackend,
    setCartLoading,
    restoreSelections,
} from '@/store/slices/cartSlice';

// Helper to get optimized image URL
const getOptimizedImageUrl = (imgSrcObject) => {
    if (!imgSrcObject) return '/images/placeholder.png';

    if (imgSrcObject.formats?.small?.url) {
        return getImageUrl(imgSrcObject.formats.small.url);
    } else if (imgSrcObject.formats?.thumbnail?.url) {
        return getImageUrl(imgSrcObject.formats.thumbnail.url);
    } else if (imgSrcObject.url) {
        return getImageUrl(imgSrcObject.url);
    }

    return '/images/placeholder.png';
};

// Helper function to generate unique cart item ID
const generateCartItemId = (productId, size, variantId) => {
    let id = productId;
    if (variantId) {
        id += `-variant-${variantId}`;
    }
    if (size) {
        id += `-size-${size}`;
    }
    return id;
};

export const useCart = () => {
    const dispatch = useDispatch();
    const { data: session } = useSession();
    const user = session?.user;
    const { showStockError, showAddToCartSuccess } = useStockNotifications();
    const initialized = useRef(false);

    // Selectors
    const cartProducts = useSelector(selectCartItems);
    const selectedCartItems = useSelector(selectSelectedItems);
    const totalPrice = useSelector(selectTotalPrice);
    const isCartLoading = useSelector(selectIsCartLoading);
    const selectedItems = useSelector(selectSelectedCartItems);
    const selectedItemsTotal = useSelector(selectSelectedItemsTotal);

    // Load cart from backend when user logs in (only once)
    // Load cart from backend when user logs in
    useEffect(() => {
        const syncAndLoadCart = async () => {
            if (user?.id) {
                console.log('👤 User detected:', user.id);

                // If there are local items (guest cart), sync them to backend first
                if (cartProducts.length > 0) {
                    console.log('🔄 Syncing guest cart items to backend...', cartProducts.length);
                    for (const item of cartProducts) {
                        // Only sync if it doesn't have a backend ID yet (meaning it's a local-only item)
                        if (!item.backendId) {
                            try {
                                console.log('➡️ Syncing item:', item.title);
                                await dispatch(syncCartItemToBackend({ userId: user.id, cartItem: item })).unwrap();
                            } catch (err) {
                                console.error('Failed to sync guest item:', item.title, err);
                            }
                        }
                    }
                    console.log('✅ Guest cart sync complete');
                }

                // Now load the full cart from backend (which will include the just-synced items)
                console.log('📥 Loading full cart from backend...');
                dispatch(loadCartFromBackend(user.id));
            } else {
                // For guests, load from sessionStorage
                if (typeof window !== 'undefined') {
                    try {
                        const savedCart = sessionStorage.getItem('guestCart');
                        if (savedCart) {
                            const items = JSON.parse(savedCart);
                            // Note: We should ideally dispatch an action to set these items
                            // But for now we just handle loading state
                            dispatch(setCartLoading(false));
                        } else {
                            dispatch(setCartLoading(false));
                        }
                    } catch (error) {
                        console.error('Error loading guest cart:', error);
                        dispatch(setCartLoading(false));
                    }
                }
            }
        };

        syncAndLoadCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, dispatch]);

    // Persist guest cart to sessionStorage
    useEffect(() => {
        if (!user && typeof window !== 'undefined') {
            try {
                sessionStorage.setItem('guestCart', JSON.stringify(cartProducts));
            } catch (error) {
                console.error('Error saving guest cart:', error);
            }
        }
    }, [cartProducts, user]);

    // Restore selections from sessionStorage when cart loads
    useEffect(() => {
        if (typeof window !== 'undefined' && cartProducts.length > 0 && !isCartLoading) {
            try {
                const saved = sessionStorage.getItem('selectedCartItems');
                if (saved) {
                    const selections = JSON.parse(saved);
                    dispatch(restoreSelections({ selections }));
                }
            } catch (error) {
                console.error('Error restoring selections:', error);
            }
        }
    }, [isCartLoading, dispatch]); // Only run when loading state changes

    // Persist selections to sessionStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                sessionStorage.setItem('selectedCartItems', JSON.stringify(selectedCartItems));
            } catch (error) {
                console.error('Error saving selections:', error);
            }
        }
    }, [selectedCartItems]);

    const addProductToCart = useCallback(async (id, qty = 1, isModal = true, variantInfo = null, selectedSize = null, productData = null) => {
        console.log('🛒 addProductToCart called with:', { id, qty, isModal, variantInfo, selectedSize, hasProductData: !!productData });

        // Generate the unique ID
        const uniqueId = generateCartItemId(
            id,
            selectedSize,
            variantInfo?.variantId
        );

        console.log('🔑 Generated uniqueId:', uniqueId);

        // Check if already in cart
        if (cartProducts.some(item => item.id === uniqueId)) {
            console.log('✅ Item already in cart, opening modal');
            if (isModal) {
                openCartModal().catch(() => { });
            }
            return;
        }

        // Extract base product ID
        let baseProductId = id;
        if (typeof id === 'string') {
            if (id.includes('-size-')) {
                baseProductId = id.split('-size-')[0];
            }
            if (baseProductId.includes('-variant-')) {
                baseProductId = baseProductId.split('-variant-')[0];
            }
        }

        // Find product info
        let productInfo = allProducts.find(product =>
            product.documentId === baseProductId ||
            product.id === baseProductId
        );

        // If not found in local data and productData was passed (Strapi products), use that
        if (!productInfo && productData) {
            productInfo = productData;
            console.log('✅ Using provided Strapi product data');
        }

        console.log('🔍 Product lookup:', { baseProductId, found: !!productInfo, totalProducts: allProducts.length, usedProvidedData: !allProducts.find(p => p.documentId === baseProductId || p.id === baseProductId) && !!productData });

        let productToAdd = null;

        if (productInfo) {
            let imgSrc = '/images/placeholder.png';
            let title = productInfo.title;

            if (variantInfo) {
                if (variantInfo.imgSrcObject) {
                    imgSrc = getOptimizedImageUrl(variantInfo.imgSrcObject);
                } else if (variantInfo.imgSrc) {
                    imgSrc = variantInfo.imgSrc;
                }
                if (variantInfo.title && variantInfo.isVariant) {
                    title = `${productInfo.title} - ${variantInfo.title}`;
                }
            } else {
                if (productInfo.imgSrc?.formats?.small?.url) {
                    imgSrc = getImageUrl(productInfo.imgSrc.formats.small.url);
                } else {
                    imgSrc = getImageUrl(productInfo.imgSrc);
                }
            }

            productToAdd = {
                id: uniqueId,
                baseProductId: baseProductId,
                documentId: productInfo.documentId,
                title: title,
                price: productInfo.price,
                oldPrice: productInfo.oldPrice || null,
                quantity: qty || 1,
                colors: productInfo.colors || [],
                sizes: productInfo.sizes || [],
                selectedSize: selectedSize,
                imgSrc: imgSrc,
                weight: productInfo.weight || null,
                variantInfo: variantInfo
            };

            // Validate stock
            if (selectedSize) {
                try {
                    const stockValidation = await validateCartStock(
                        baseProductId,
                        variantInfo?.variantId || null,
                        selectedSize,
                        qty || 1,
                        0
                    );

                    if (!stockValidation.success) {
                        showStockError(stockValidation.error, stockValidation.availableStock, productToAdd.title);
                        return;
                    }
                } catch (stockError) {
                    console.error('Stock validation error:', stockError);
                }
            }
        }

        if (productToAdd) {
            // Add to Redux store
            dispatch(addProductAction({ product: productToAdd }));

            // Sync to backend if user is logged in and wait for completion
            if (user?.id) {
                try {
                    await dispatch(syncCartItemToBackend({ userId: user.id, cartItem: productToAdd })).unwrap();
                } catch (error) {
                    console.error('Error syncing to backend:', error);
                    // Continue even if backend sync fails - item is in local state
                }
            }

            // Show success message
            if (showAddToCartSuccess) {
                showAddToCartSuccess(productToAdd.title);
            }

            // Open cart modal - now the item should be fully synced
            if (isModal) {
                openCartModal().catch(() => { });
            }
        }
    }, [dispatch, user, cartProducts, showStockError, showAddToCartSuccess]);

    const removeCartItem = useCallback((id, backendDocumentId) => {
        dispatch(removeProductFromCart({ id }));

        if (user?.id && backendDocumentId) {
            dispatch(removeCartItemFromBackend(backendDocumentId));
        }
    }, [dispatch, user]);

    const increaseQuantity = useCallback((id, backendDocumentId) => {
        dispatch(increaseQty({ id }));

        if (user?.id && backendDocumentId) {
            const item = cartProducts.find(p => p.id === id);
            if (item) {
                dispatch(updateCartItemQuantityInBackend({
                    backendDocumentId,
                    quantity: item.quantity + 1
                }));
            }
        }
    }, [dispatch, user, cartProducts]);

    const decreaseQuantity = useCallback((id, backendDocumentId) => {
        dispatch(decreaseQty({ id }));

        if (user?.id && backendDocumentId) {
            const item = cartProducts.find(p => p.id === id);
            if (item && item.quantity > 1) {
                dispatch(updateCartItemQuantityInBackend({
                    backendDocumentId,
                    quantity: item.quantity - 1
                }));
            }
        }
    }, [dispatch, user, cartProducts]);

    const updateQuantity = useCallback((id, quantity, backendDocumentId) => {
        dispatch(updateQty({ id, quantity }));

        if (user?.id && backendDocumentId) {
            dispatch(updateCartItemQuantityInBackend({ backendDocumentId, quantity }));
        }
    }, [dispatch, user]);

    const toggleCartItemSelection = useCallback((id) => {
        dispatch(toggleItemSelection({ id }));
    }, [dispatch]);

    const selectAllCartItems = useCallback((selectAll = true) => {
        dispatch(selectAllItems({ selectAll }));
    }, [dispatch]);

    const clearCart = useCallback(() => {
        dispatch(clearCartAction());
    }, [dispatch]);

    const getSelectedCartItems = useCallback(() => {
        return selectedItems;
    }, [selectedItems]);

    const getSelectedItemsTotal = useCallback(() => {
        return selectedItemsTotal;
    }, [selectedItemsTotal]);

    const isAddedToCartProducts = useCallback((id) => {
        return cartProducts.some(item => item.id === id);
    }, [cartProducts]);

    const isProductSizeInCart = useCallback((productDocumentId, selectedSize, variantId = null) => {
        if (!productDocumentId || !selectedSize) return false;

        return cartProducts.some(cartItem => {
            const productMatches = cartItem.documentId === productDocumentId ||
                cartItem.baseProductId === productDocumentId;
            const sizeMatches = cartItem.selectedSize === selectedSize;

            let variantMatches = true;
            if (variantId) {
                if (cartItem.variantInfo?.variantId) {
                    variantMatches = cartItem.variantInfo.variantId === variantId;
                } else {
                    variantMatches = false;
                }
            } else {
                variantMatches = !cartItem.variantInfo || !cartItem.variantInfo.isVariant;
            }

            return productMatches && sizeMatches && variantMatches;
        });
    }, [cartProducts]);

    return {
        cartProducts,
        selectedCartItems,
        totalPrice,
        isCartLoading,
        addProductToCart,
        removeCartItem,
        increaseQuantity,
        decreaseQuantity,
        updateQuantity,
        toggleCartItemSelection,
        selectAllCartItems,
        clearCart,
        getSelectedCartItems,
        getSelectedItemsTotal,
        isAddedToCartProducts,
        isProductSizeInCart,
    };
};
