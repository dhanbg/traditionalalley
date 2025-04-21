"use client";
import { products3 } from "@/data/productsWomen";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useContextElement } from "@/context/Context";

// Default placeholder image
const DEFAULT_IMAGE = '/images/placeholder.jpg';

export default function ProductCard2({
  product = products3[0],
  addedClass = "",
}) {
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
      className={`card-product bundle-hover-item  ${addedClass} wow fadeInUp`}
      data-wow-delay={product.wowDelay}
    >
      <div className="card-product-wrapper">
        <Link href={`/product-detail/${safeProduct.id}`} className="product-img">
          <Image
            className="lazyload img-product"
            data-src={safeProduct.imgSrc}
            src={currentImage || DEFAULT_IMAGE}
            alt={safeProduct.title}
            width={351}
            height={468}
          />
          <Image
            className="lazyload img-hover"
            data-src={safeProduct.imgHover}
            src={safeProduct.imgHover || currentImage || DEFAULT_IMAGE}
            alt={safeProduct.title}
            width={600}
            height={800}
          />
        </Link>
        <div className="on-sale-wrap">
          <span className="on-sale-item">{product.saleText}</span>
        </div>
        <div className="list-btn-main">
          <a
            href="#quickView"
            onClick={() => setQuickViewItem(product)}
            data-bs-toggle="modal"
            className="btn-main-product"
          >
            Quick View
          </a>
        </div>
      </div>
      <div className="card-product-info">
        <Link href={`/product-detail/${safeProduct.id}`} className="title link">
          {safeProduct.title}
        </Link>
        <span className="price">
          <span className="old-price">${safeProduct.price.toFixed(2)}</span>$
          {safeProduct.oldPrice.toFixed(2)}
        </span>
        <ul className="list-color-product">
          {safeProduct.colors.map((color, idx) => (
            <li
              className={`list-color-item color-swatch ${
                currentImage == color.imgSrc ? "active" : ""
              }  ${color.bgColor == "bg-white" ? "line" : ""}`}
              onMouseOver={() => setCurrentImage(color.imgSrc)}
              key={idx}
            >
              <span className={`swatch-value ${color.bgColor}`} />
              <Image
                className="lazyload"
                data-src={color.imgSrc}
                src={color.imgSrc || DEFAULT_IMAGE}
                alt="image-product"
                width={600}
                height={800}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
