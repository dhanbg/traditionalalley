"use client";
import { useContextElement } from "@/context/Context";
import { products41 } from "@/data/productsWomen";
import Image from "next/image";
import React, { useState, createContext, useContext } from "react";
import QuantitySelect from "./QuantitySelect";
import SizeSelect2 from "./SideSelect2";

// Create a context for product data
export const ProductContext = createContext(null);

// Hook to use the product context
export const useProductContext = () => useContext(ProductContext);

export default function ProductStikyBottom() {
  const {
    addProductToCart,
    isAddedToCartProducts,
    cartProducts,
    updateQuantity,
  } = useContextElement();
  
  // Get the product from context
  const product = useProductContext() || products41[2]; // Fallback to default product
  
  const [quantity, setQuantity] = useState(1); // Initial quantity is 1

  return (
    <div className="tf-sticky-btn-atc">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <form
              className="form-sticky-atc"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="tf-sticky-atc-product">
                <div className="image">
                  <Image
                    className="lazyload"
                    alt=""
                    src={product.imgSrc}
                    width={600}
                    height={800}
                  />
                </div>
                <div className="content">
                  <div className="text-title">{product.title}</div>
                  <div className="text-caption-1 text-secondary-2">
                    {product.colors && product.colors.length > 0 ? (
                      typeof product.colors[0] === 'string' 
                        ? product.colors[0] 
                        : product.colors[0].name
                    ) : ""}
                    {product.sizes && product.sizes.length > 0 ? `, ${product.sizes[0]}` : ""}
                    , Cotton
                  </div>
                  <div className="text-title">
                    ${product.price.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="tf-sticky-atc-infos">
                <SizeSelect2 />
                <div className="tf-sticky-atc-quantity d-flex gap-12 align-items-center">
                  <div className="tf-sticky-atc-infos-title text-title">
                    Quantity:
                  </div>
                  <QuantitySelect
                    styleClass="style-1"
                    quantity={
                      isAddedToCartProducts(product.id)
                        ? cartProducts.filter(
                            (elm) => elm.id == product.id
                          )[0].quantity
                        : quantity
                    }
                    setQuantity={(qty) => {
                      if (isAddedToCartProducts(product.id)) {
                        updateQuantity(product.id, qty);
                      } else {
                        setQuantity(qty);
                      }
                    }}
                  />
                </div>
                <div className="tf-sticky-atc-btns">
                  <a
                    onClick={() => addProductToCart(product.id, quantity)}
                    className="tf-btn w-100 btn-reset radius-4 btn-add-to-cart"
                  >
                    <span className="text text-btn-uppercase">
                      {" "}
                      {isAddedToCartProducts(product.id)
                        ? "Already Added"
                        : "Add to cart -"}
                    </span>
                    <span className="tf-qty-price total-price">
                      $
                      {isAddedToCartProducts(product.id)
                        ? (
                            product.price *
                            cartProducts.filter(
                              (elm) => elm.id == product.id
                            )[0].quantity
                          ).toFixed(2)
                        : (product.price * quantity).toFixed(2)}
                    </span>
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
