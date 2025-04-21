"use client";
import React, { useState } from "react";
import Slider1 from "../sliders/Slider1";
import ColorSelect from "../ColorSelect";
import SizeSelect from "../SizeSelect";
import QuantitySelect from "../QuantitySelect";
import Image from "next/image";
import { useContextElement } from "@/context/Context";
import { useClerk } from "@clerk/nextjs";
import Link from "next/link";

export default function Details1({ product }) {
  // Set default values for missing properties to prevent errors
  const safeProduct = {
    ...product,
    colors: product.colors || [],
    sizes: product.sizes || [],
    price: product.price || 0,
    oldPrice: product.oldPrice || null,
    imgSrc: product.imgSrc || '/images/placeholder.jpg',
    imgHover: product.imgHover || product.imgSrc || '/images/placeholder.jpg',
    gallery: product.gallery || []
  };

  const [activeColor, setActiveColor] = useState(
    safeProduct.colors && safeProduct.colors.length > 0
      ? (typeof safeProduct.colors[0] === 'string' 
          ? safeProduct.colors[0]
          : safeProduct.colors[0].name || "Gray")
      : "Gray"
  );
  const [quantity, setQuantity] = useState(1);
  const {
    addProductToCart,
    isAddedToCartProducts,
    addToWishlist,
    isAddedtoWishlist,
    isAddedtoCompareItem,
    addToCompareItem,
    cartProducts,
    updateQuantity,
    user,
  } = useContextElement();
  const { openSignIn } = useClerk();

  const handleWishlistClick = () => {
    if (!user) {
      openSignIn();
    } else {
      addToWishlist(safeProduct.id);
    }
  };

  const handleCartClick = () => {
    if (!user) {
      openSignIn();
    } else {
      addProductToCart(safeProduct.id, quantity);
    }
  };

  return (
    <section className="flat-spacing">
      <div className="tf-main-product section-image-zoom">
        <div className="container">
          <div className="row">
            {/* Product default */}
            <div className="col-md-66">
              <div className="tf-product-media-wrap sticky-top">
                <Slider1
                  setActiveColor={setActiveColor}
                  activeColor={activeColor}
                  firstItem={safeProduct.imgSrc}
                  imgHover={safeProduct.imgHover}
                  gallery={safeProduct.gallery}
                  slideItems={
                    // Map colors to slideItems format if they have imgSrc
                    safeProduct.colors && safeProduct.colors.length > 0 && 
                    safeProduct.colors[0].imgSrc
                      ? safeProduct.colors.map((color, index) => ({
                          id: index + 1,
                          src: color.imgSrc,
                          alt: color.name,
                          color: color.name,
                          width: 600,
                          height: 800,
                          imgSrc: color.imgSrc
                        }))
                      : undefined
                  }
                />
              </div>
            </div>
            {/* /Product default */}
            {/* tf-product-info-list */}
            <div className="col-md-7">
              <div className="tf-product-info-wrap position-relative mw-100p-hidden ">
                <div className="tf-zoom-main" />
                <div className="tf-product-info-list other-image-zoom">
                  <div className="tf-product-info-heading">
                    <div className="tf-product-info-name">
                      <div className="text text-btn-uppercase">
                        {safeProduct.category?.title || "Product"}
                      </div>
                      <h3 className="name">{safeProduct.title}</h3>
                      <div className="sub">
                        <div className="tf-product-info-rate">
                          <div className="list-star">
                            <i className="icon icon-star" />
                            <i className="icon icon-star" />
                            <i className="icon icon-star" />
                            <i className="icon icon-star" />
                            <i className="icon icon-star" />
                          </div>
                          <div className="text text-caption-1">
                            (134 reviews)
                          </div>
                        </div>
                        <div className="tf-product-info-sold">
                          <i className="icon icon-lightning" />
                          <div className="text text-caption-1">
                            18&nbsp;sold in last&nbsp;32&nbsp;hours
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="tf-product-info-desc">
                      <div className="tf-product-info-price">
                        <h5 className="price-on-sale font-2">
                          {" "}
                          ${safeProduct.price.toFixed(2)}
                        </h5>
                        {safeProduct.oldPrice ? (
                          <>
                            <div className="compare-at-price font-2">
                              {" "}
                              ${safeProduct.oldPrice.toFixed(2)}
                            </div>
                            <div className="badges-on-sale text-btn-uppercase">
                              -25%
                            </div>
                          </>
                        ) : (
                          ""
                        )}
                      </div>
                      <p>
                        The garments labelled as Committed are products that
                        have been produced using sustainable fibres or
                        processes, reducing their environmental impact.
                      </p>
                      <div className="tf-product-info-liveview">
                        <i className="icon icon-eye" />
                        <p className="text-caption-1">
                          <span className="liveview-count">28</span> people are
                          viewing this right now
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="tf-product-info-choose-option">
                    {/* Colors section */}
                    {safeProduct.colors && safeProduct.colors.length > 0 && (
                      <div className="tf-product-info-color">
                        <ColorSelect 
                          activeColor={activeColor}
                          setActiveColor={setActiveColor}
                          colorOptions={
                            safeProduct.colors.map((color, index) => {
                              // Handle different color formats
                              if (typeof color === 'string') {
                                return {
                                  id: `values-${color.toLowerCase()}-${index}`,
                                  value: color,
                                  color: color.toLowerCase()
                                };
                              } else if (color.name) {
                                return {
                                  id: `values-${color.name.toLowerCase()}-${index}`,
                                  value: color.name,
                                  color: color.name.toLowerCase()
                                };
                              }
                              return {
                                id: `values-unknown-${index}`,
                                value: "Unknown",
                                color: "gray"
                              };
                            })
                          }
                        />
                      </div>
                    )}
                  
                    {/* Sizes section */}
                    {safeProduct.sizes && safeProduct.sizes.length > 0 && (
                      <div className="tf-product-info-size">
                        <SizeSelect 
                          sizes={
                            safeProduct.sizes.map((size, index) => ({
                              id: `values-${typeof size === 'string' ? size.toLowerCase() : size}-${index}`,
                              value: typeof size === 'string' ? size : size,
                              price: safeProduct.price,
                              disabled: false
                            }))
                          }
                        />
                      </div>
                    )}

                    <div className="tf-product-info-quantity">
                      <div className="title mb_12">Quantity:</div>
                      <QuantitySelect
                        quantity={
                          isAddedToCartProducts(safeProduct.id)
                            ? (cartProducts.filter(
                                (elm) => elm.id == safeProduct.id
                              )[0]?.quantity || quantity)
                            : quantity
                        }
                        setQuantity={(qty) => {
                          console.log(`Details1: setQuantity called with qty ${qty}`);
                          if (isAddedToCartProducts(safeProduct.id)) {
                            console.log(`Details1: Product ${safeProduct.id} in cart, calling updateQuantity`);
                            // Return the Promise from updateQuantity so it can be awaited
                            return updateQuantity(safeProduct.id, qty);
                          } else {
                            console.log(`Details1: Product ${safeProduct.id} not in cart, updating local state`);
                            setQuantity(qty);
                            // Return a resolved Promise for consistent behavior
                            return Promise.resolve();
                          }
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <div className="tf-product-info-by-btn mb_10">
                        <a
                          onClick={handleCartClick}
                          className="btn-style-2 flex-grow-1 text-btn-uppercase fw-6 btn-add-to-cart"
                        >
                          <span>
                            {user && isAddedToCartProducts(safeProduct.id)
                              ? "Already Added"
                              : "Add to cart -"}
                          </span>
                          <span className="tf-qty-price total-price">
                            $
                            {user && isAddedToCartProducts(safeProduct.id)
                              ? (
                                  safeProduct.price *
                                  (cartProducts.filter(
                                    (elm) => elm.id == safeProduct.id
                                  )[0]?.quantity || 1)
                                ).toFixed(2)
                              : (safeProduct.price * quantity).toFixed(2)}{" "}
                          </span>
                        </a>
                        <a
                          href="#compare"
                          data-bs-toggle="offcanvas"
                          aria-controls="compare"
                          onClick={() => addToCompareItem(safeProduct.id)}
                          className="box-icon hover-tooltip compare btn-icon-action"
                        >
                          <span className="icon icon-gitDiff" />
                          <span className="tooltip text-caption-2">
                            {isAddedtoCompareItem(safeProduct.id)
                              ? "Already compared"
                              : "Compare"}
                          </span>
                        </a>
                        <a
                          onClick={handleWishlistClick}
                          className="box-icon hover-tooltip text-caption-2 wishlist btn-icon-action"
                        >
                          <span className="icon icon-heart" />
                          <span className="tooltip text-caption-2">
                            {user && isAddedtoWishlist(safeProduct.id)
                              ? "Already Wishlisted"
                              : "Wishlist"}
                          </span>
                        </a>
                      </div>
                      <a href="#" className="btn-style-3 text-btn-uppercase">
                        Buy it now
                      </a>
                    </div>
                    <div className="tf-product-info-help">
                      <div className="tf-product-info-extra-link">
                        <a
                          href="#delivery_return"
                          data-bs-toggle="modal"
                          className="tf-product-extra-icon"
                        >
                          <div className="icon">
                            <i className="icon-shipping" />
                          </div>
                          <p className="text-caption-1">
                            Delivery &amp; Return
                          </p>
                        </a>
                        <a
                          href="#ask_question"
                          data-bs-toggle="modal"
                          className="tf-product-extra-icon"
                        >
                          <div className="icon">
                            <i className="icon-question" />
                          </div>
                          <p className="text-caption-1">Ask A Question</p>
                        </a>
                        <a
                          href="#share_social"
                          data-bs-toggle="modal"
                          className="tf-product-extra-icon"
                        >
                          <div className="icon">
                            <i className="icon-share" />
                          </div>
                          <p className="text-caption-1">Share</p>
                        </a>
                      </div>
                      <div className="tf-product-info-time">
                        <div className="icon">
                          <i className="icon-timer" />
                        </div>
                        <p className="text-caption-1">
                          Estimated Delivery:&nbsp;&nbsp;<span>12-26 days</span>
                          (International), <span>3-6 days</span> (United States)
                        </p>
                      </div>
                      <div className="tf-product-info-return">
                        <div className="icon">
                          <i className="icon-arrowClockwise" />
                        </div>
                        <p className="text-caption-1">
                          Return within <span>45 days</span> of purchase. Duties
                          &amp; taxes are non-refundable.
                        </p>
                      </div>
                      <div className="dropdown dropdown-store-location">
                        <div
                          className="dropdown-title dropdown-backdrop"
                          data-bs-toggle="dropdown"
                          aria-haspopup="true"
                        >
                          <div className="tf-product-info-view link">
                            <div className="icon">
                              <i className="icon-map-pin" />
                            </div>
                            <span>View Store Information</span>
                          </div>
                        </div>
                        <div className="dropdown-menu dropdown-menu-end">
                          <div className="dropdown-content">
                            <div className="dropdown-content-heading">
                              <h5>Store Location</h5>
                              <i className="icon icon-close" />
                            </div>
                            <div className="line-bt" />
                            <div>
                              <h6>Fashion Modave</h6>
                              <p>Pickup available. Usually ready in 24 hours</p>
                            </div>
                            <div>
                              <p>766 Rosalinda Forges Suite 044,</p>
                              <p>Gracielahaven, Oregon</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ul className="tf-product-info-sku">
                      <li>
                        <p className="text-caption-1">SKU:</p>
                        <p className="text-caption-1 text-1">53453412</p>
                      </li>
                      <li>
                        <p className="text-caption-1">Vendor:</p>
                        <p className="text-caption-1 text-1">Modave</p>
                      </li>
                      <li>
                        <p className="text-caption-1">Available:</p>
                        <p className="text-caption-1 text-1">Instock</p>
                      </li>
                      <li>
                        <p className="text-caption-1">Categories:</p>
                        <p className="text-caption-1">
                          <a href="#" className="text-1 link">
                            Clothes
                          </a>
                          ,
                          <a href="#" className="text-1 link">
                            women
                          </a>
                          ,
                          <a href="#" className="text-1 link">
                            T-shirt
                          </a>
                        </p>
                      </li>
                    </ul>
                    <div className="tf-product-info-guranteed">
                      <div className="text-title">Guranteed safe checkout:</div>
                      <div className="tf-payment">
                        <a href="#">
                          <Image
                            alt=""
                            src="/images/payment/img-1.png"
                            width={100}
                            height={64}
                          />
                        </a>
                        <a href="#">
                          <Image
                            alt=""
                            src="/images/payment/img-2.png"
                            width={100}
                            height={64}
                          />
                        </a>
                        <a href="#">
                          <Image
                            alt=""
                            src="/images/payment/img-3.png"
                            width={100}
                            height={64}
                          />
                        </a>
                        <a href="#">
                          <Image
                            alt=""
                            src="/images/payment/img-4.png"
                            width={98}
                            height={64}
                          />
                        </a>
                        <a href="#">
                          <Image
                            alt=""
                            src="/images/payment/img-5.png"
                            width={102}
                            height={64}
                          />
                        </a>
                        <a href="#">
                          <Image
                            alt=""
                            src="/images/payment/img-6.png"
                            width={98}
                            height={64}
                          />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* /tf-product-info-list */}
          </div>
        </div>
      </div>
    </section>
  );
}
