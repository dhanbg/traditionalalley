"use client";
import { products43 } from "@/data/productsWomen";
import React, { useState } from "react";
import Image from "next/image";
import { useContextElement } from "@/context/Context";
import { useClerk } from "@clerk/nextjs";

const BoughtTogether = () => {
  const {
    addProductToCart,
    isAddedToCartProducts,
    cartProducts,
    updateQuantity,
    user
  } = useContextElement();
  const { openSignIn } = useClerk();
  const [products, setProducts] = useState([
    ...products43.map((el) => ({ ...el, checked: false })),
  ]);

  const handleCheckboxChange = (id) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id ? { ...product, checked: !product.checked } : product
      )
    );
  };

  const handleVariantChange = (id, selectedVariant) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id ? { ...product, selectedVariant } : product
      )
    );
  };

  const selectedProducts = products.filter((product) => product.checked);
  const totalPrice = selectedProducts.reduce(
    (total, product) => total + product.price,
    0
  );
  const totaloldPrice = selectedProducts.reduce(
    (total, product) => total + (product.oldPrice || 0),
    0
  );

  const handleAddAllToCart = () => {
    if (!user) {
      openSignIn();
    } else {
      const selectedIds = selectedProducts.map((prod) => prod.id);
      
      selectedIds.forEach((id) => addProductToCart(id));
    }
  };

  return (
    <form className="form-bundle-product" onSubmit={(e) => e.preventDefault()}>
      <h5 className="mb_16">Frequently bought together</h5>
      {products.map((product) => (
        <div key={product.id} className="tf-bundle-product-item">
          <input
            className="tf-check"
            type="checkbox"
            checked={product.checked}
            readOnly
            onChange={() => handleCheckboxChange(product.id)}
          />
          <div className="tf-product-bundle-image">
            <a href="#">
              <Image
                alt={product.title}
                src={product.imgSrc}
                width={600}
                height={800}
              />
            </a>
          </div>
          <div className="tf-product-bundle-infos">
            <div className="text-title">{product.title}</div>
            <div className="tf-product-bundle-variant tf-select">
              <select
                value={product.selectedVariant}
                onChange={(e) =>
                  handleVariantChange(product.id, e.target.value)
                }
              >
                {product.variants.map((variant, index) => (
                  <option key={index} value={variant}>
                    {variant}
                  </option>
                ))}
              </select>
            </div>
            <div className="tf-product-info-price type-small">
              <h5 className="price-on-sale">${product.price.toFixed(2)}</h5>
              {product.oldPrice && (
                <div className="compare-at-price">
                  ${product.oldPrice.toFixed(2)}
                </div>
              )}
              {product.discount && (
                <div className="badges-on-sale">{product.discount}</div>
              )}
            </div>
          </div>
        </div>
      ))}
      <div className="tf-bundle-product-total-submit">
        <h6>Total price:</h6>
        <div className="tf-product-info-price type-1">
          <h4 className="price-on-sale">${totalPrice.toFixed(2)}</h4>
          {totaloldPrice > 0 && (
            <div className="compare-at-price">${totaloldPrice.toFixed(2)}</div>
          )}
          {totaloldPrice > totalPrice && (
            <div className="badges-on-sale">
              -
              {Math.round(((totaloldPrice - totalPrice) / totaloldPrice) * 100)}
              %
            </div>
          )}
        </div>
      </div>
      <div className="cart-actions">
        <div className="cart-total">
          <div className="text-caption-1">
            {selectedProducts.length} items
          </div>
          <div className="text-title">
            ${totalPrice.toFixed(2)}
          </div>
        </div>
        <button
          className="btn-style-2 text-btn-uppercase"
          onClick={handleAddAllToCart}
        >
          Add All To Cart
        </button>
      </div>
    </form>
  );
};

export default BoughtTogether;
