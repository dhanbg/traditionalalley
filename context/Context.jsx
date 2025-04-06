"use client";
import { allProducts } from "@/data/productsWomen";
import { openCartModal } from "@/utils/openCartModal";
import { openWistlistModal } from "@/utils/openWishlist";
import { useUser } from "@clerk/nextjs";

import React, { useContext, useEffect, useState } from "react";
const dataContext = React.createContext();
export const useContextElement = () => {
  return useContext(dataContext);
};

export default function Context({ children }) {
  const { user } = useUser();
  const [cartProducts, setCartProducts] = useState([]);
  const [wishList, setWishList] = useState([1, 2, 3]);
  const [compareItem, setCompareItem] = useState([1, 2, 3]);
  const [quickViewItem, setQuickViewItem] = useState(allProducts[0]);
  const [quickAddItem, setQuickAddItem] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  useEffect(() => {
    const subtotal = cartProducts.reduce((accumulator, product) => {
      return accumulator + product.quantity * product.price;
    }, 0);
    setTotalPrice(subtotal);
  }, [cartProducts]);

  const isAddedToCartProducts = (id) => {
    if (cartProducts.filter((elm) => elm.id == id)[0]) {
      return true;
    }
    return false;
  };
  const addProductToCart = (id, qty, isModal = true) => {
    if (!isAddedToCartProducts(id)) {
      const item = {
        ...allProducts.filter((elm) => elm.id == id)[0],
        quantity: qty ? qty : 1,
      };
      setCartProducts((pre) => [...pre, item]);
      if (isModal) {
        openCartModal();
      }
    }
  };

  const updateQuantity = (id, qty) => {
    if (isAddedToCartProducts(id)) {
      let item = cartProducts.filter((elm) => elm.id == id)[0];
      let items = [...cartProducts];
      const itemIndex = items.indexOf(item);

      item.quantity = qty / 1;
      items[itemIndex] = item;
      setCartProducts(items);
    }
  };

  const addToWishlist = (id) => {
    if (!wishList.includes(id)) {
      setWishList((pre) => [...pre, id]);
      openWistlistModal();
    }
  };

  const removeFromWishlist = (id) => {
    if (wishList.includes(id)) {
      setWishList((pre) => [...pre.filter((elm) => elm != id)]);
    }
  };
  const addToCompareItem = (id) => {
    if (!compareItem.includes(id)) {
      setCompareItem((pre) => [...pre, id]);
    }
  };
  const removeFromCompareItem = (id) => {
    if (compareItem.includes(id)) {
      setCompareItem((pre) => [...pre.filter((elm) => elm != id)]);
    }
  };
  const isAddedtoWishlist = (id) => {
    if (wishList.includes(id)) {
      return true;
    }
    return false;
  };
  const isAddedtoCompareItem = (id) => {
    if (compareItem.includes(id)) {
      return true;
    }
    return false;
  };
  
  // Load cart data based on user login status
  useEffect(() => {
    if (user) {
      // User is logged in - load cart from user-specific localStorage
      const userSpecificKey = `cartList_${user.id}`;
      const items = JSON.parse(localStorage.getItem(userSpecificKey));
      if (items?.length) {
        setCartProducts(items);
      } else {
        // If user has no cart yet, but there are items in the anonymous cart,
        // migrate those items to the user's cart
        const anonymousItems = JSON.parse(localStorage.getItem("cartList"));
        if (anonymousItems?.length) {
          setCartProducts(anonymousItems);
          localStorage.setItem(userSpecificKey, JSON.stringify(anonymousItems));
          // Optionally clear the anonymous cart
          localStorage.removeItem("cartList");
        }
      }
    } else {
      // No user logged in - load from anonymous localStorage
      const items = JSON.parse(localStorage.getItem("cartList"));
      if (items?.length) {
        setCartProducts(items);
      }
    }
  }, [user]); // Re-run when user changes (login/logout)

  // Save cart data based on user login status
  useEffect(() => {
    if (user) {
      // User is logged in - save to user-specific localStorage
      localStorage.setItem(`cartList_${user.id}`, JSON.stringify(cartProducts));
    } else {
      // No user logged in - save to anonymous localStorage
      localStorage.setItem("cartList", JSON.stringify(cartProducts));
    }
  }, [cartProducts, user]);
  
  // Load wishlist based on user login status
  useEffect(() => {
    if (user) {
      const userSpecificKey = `wishlist_${user.id}`;
      const items = JSON.parse(localStorage.getItem(userSpecificKey));
      if (items?.length) {
        setWishList(items);
      } else {
        // If user has no wishlist yet, but there are items in the anonymous wishlist,
        // migrate those items to the user's wishlist
        const anonymousItems = JSON.parse(localStorage.getItem("wishlist"));
        if (anonymousItems?.length) {
          setWishList(anonymousItems);
          localStorage.setItem(userSpecificKey, JSON.stringify(anonymousItems));
          // Optionally clear the anonymous wishlist
          localStorage.removeItem("wishlist");
        }
      }
    } else {
      const items = JSON.parse(localStorage.getItem("wishlist"));
      if (items?.length) {
        setWishList(items);
      }
    }
  }, [user]);

  // Save wishlist based on user login status
  useEffect(() => {
    if (user) {
      localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(wishList));
    } else {
      localStorage.setItem("wishlist", JSON.stringify(wishList));
    }
  }, [wishList, user]);

  const contextElement = {
    user,
    cartProducts,
    setCartProducts,
    totalPrice,
    addProductToCart,
    isAddedToCartProducts,
    removeFromWishlist,
    addToWishlist,
    isAddedtoWishlist,
    quickViewItem,
    wishList,
    setQuickViewItem,
    quickAddItem,
    setQuickAddItem,
    addToCompareItem,
    isAddedtoCompareItem,
    removeFromCompareItem,
    compareItem,
    setCompareItem,
    updateQuantity,
  };
  return (
    <dataContext.Provider value={contextElement}>
      {children}
    </dataContext.Provider>
  );
}
