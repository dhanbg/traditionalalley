"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CountdownTimer from "../common/Countdown";

import { useContextElement } from "@/context/Context";

// Default placeholder image
const DEFAULT_IMAGE = '/images/placeholder.jpg';

export default function ProductsCards6({ product }) {
  // Ensure product has valid image properties
  const safeProduct = {
    ...product,
    imgSrc: product.imgSrc || DEFAULT_IMAGE,
    imgHover: product.imgHover || product.imgSrc || DEFAULT_IMAGE,
    colors: Array.isArray(product.colors) ? product.colors.map(color => ({
      ...color,
      imgSrc: color.imgSrc || DEFAULT_IMAGE
    })) : []
  };

  const [currentImage, setCurrentImage] = useState(safeProduct.imgSrc);

  const {
    setQuickAddItem,
    addToWishlist,
    isAddedtoWishlist,
    addToCompareItem,
    isAddedtoCompareItem,
    setQuickViewItem,
    addProductToCart,
    isAddedToCartProducts,
  } = useContextElement();

  useEffect(() => {
    // Ensure we never set an empty string as the currentImage
    setCurrentImage(safeProduct.imgSrc || DEFAULT_IMAGE);
  }, [safeProduct]);

  return (
    <div
      className="card-product style-list"
      data-availability="In stock"
      data-brand="gucci"
    >
      <div className="card-product-wrapper">
        <Link href={`/product-detail/${safeProduct.id}`} className="product-img">
          <Image
            className="lazyload img-product"
            src={currentImage || DEFAULT_IMAGE}
            alt={safeProduct.title}
            width={600}
            height={800}
          />
          <Image
            className="lazyload img-hover"
            src={safeProduct.imgHover || currentImage || DEFAULT_IMAGE}
            alt={safeProduct.title}
            width={600}
            height={800}
          />
        </Link>
        {safeProduct.isOnSale && (
          <div className="on-sale-wrap">
            <span className="on-sale-item">-25%</span>
          </div>
        )}
      </div>
      <div className="card-product-info">
        <Link href={`/product-detail/${safeProduct.id}`} className="title link">
          {safeProduct.title}
        </Link>
        <span className="price current-price">
          {safeProduct.oldPrice && (
            <span className="old-price">${safeProduct.oldPrice.toFixed(2)}</span>
          )}{" "}
          ${safeProduct.price?.toFixed(2)}
        </span>
        {/* Sustainability information: Explains what "Committed" label means for eco-friendly products */}
        {/* <p className="description text-secondary text-line-clamp-2">
          The garments labelled as Committed are products that have been
          produced using sustainable fibres or processes, reducing their
          environmental impact.
        </p> */}
        <div className="variant-wrap-list">
          {safeProduct.colors && safeProduct.colors.length > 0 && (
            <ul className="list-color-product">
              {safeProduct.colors.map((color, index) => (
                <li
                  key={index}
                  className={`list-color-item color-swatch ${
                    currentImage == color.imgSrc ? "active" : ""
                  } `}
                  onMouseOver={() => setCurrentImage(color.imgSrc || DEFAULT_IMAGE)}
                >
                  <span className={`swatch-value ${color.bgColor}`} />
                  <Image
                    className="lazyload"
                    src={color.imgSrc || DEFAULT_IMAGE}
                    alt="color variant"
                    width={600}
                    height={800}
                  />
                </li>
              ))}
            </ul>
          )}
          {safeProduct.sizes && (
            <div className="size-box list-product-btn">
              <span className="size-item box-icon">S</span>
              <span className="size-item box-icon">M</span>
              <span className="size-item box-icon">L</span>
              <span className="size-item box-icon">XL</span>
              <span className="size-item box-icon disable">XXL</span>
            </div>
          )}
          <div className="list-product-btn">
            <a
              onClick={() => addProductToCart(safeProduct.id)}
              className="btn-main-product"
            >
              {isAddedToCartProducts(safeProduct.id)
                ? "Already Added"
                : "Add To cart"}
            </a>
            <a
              onClick={() => addToWishlist(safeProduct.id)}
              className="box-icon wishlist btn-icon-action"
            >
              <span className="icon icon-heart" />
              <span className="tooltip">
                {isAddedtoWishlist(safeProduct.id)
                  ? "Already Wishlished"
                  : "Wishlist"}
              </span>
            </a>
            <a
              href="#compare"
              data-bs-toggle="offcanvas"
              aria-controls="compare"
              onClick={() => addToCompareItem(safeProduct.id)}
              className="box-icon compare btn-icon-action"
            >
              <span className="icon icon-gitDiff" />
              <span className="tooltip">
                {" "}
                {isAddedtoCompareItem(safeProduct.id)
                  ? "Already compared"
                  : "Compare"}
              </span>
            </a>
            <a
              href="#quickView"
              onClick={() => setQuickViewItem(safeProduct)}
              data-bs-toggle="modal"
              className="box-icon quickview tf-btn-loading"
            >
              <span className="icon icon-eye" />
              <span className="tooltip">Quick View</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
