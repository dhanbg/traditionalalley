"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import SizeSelect from "../productDetails/SizeSelect";
import ColorSelect from "../productDetails/ColorSelect";
import Grid5 from "../productDetails/grids/Grid5";
import { useContextElement } from "@/context/Context";
import QuantitySelect from "../productDetails/QuantitySelect";
import { useClerk } from "@clerk/nextjs";
import { PRODUCT_REVIEWS_API } from "../../utils/urls";
import { fetchDataFromApi } from "../../utils/api";

export default function QuickView() {
  const [activeColor, setActiveColor] = useState("gray");
  const [quantity, setQuantity] = useState(1); // Initial quantity is 1
  const [activeTab, setActiveTab] = useState(1);
  const {
    quickViewItem,
    setQuickViewItem,
    addProductToCart,
    isAddedToCartProducts,
    addToWishlist,
    isAddedtoWishlist,
    addToCompareItem,
    isAddedtoCompareItem,
    cartProducts,
    updateQuantity,
    user,
  } = useContextElement();
  const { openSignIn } = useClerk();
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    async function getReviewCount() {
      if (!quickViewItem?.documentId) return;
      try {
        const res = await fetchDataFromApi(PRODUCT_REVIEWS_API(quickViewItem.documentId));
        setReviewCount(res?.data?.length || 0);
      } catch {
        setReviewCount(0);
      }
    }
    getReviewCount();
  }, [quickViewItem?.documentId]);

  const openModalSizeChoice = () => {
    const bootstrap = require("bootstrap"); // dynamically import bootstrap
    var myModal = new bootstrap.Modal(document.getElementById("size-guide"), {
      keyboard: false,
    });

    myModal.show();
    document
      .getElementById("size-guide")
      .addEventListener("hidden.bs.modal", () => {
        myModal.hide();
      });
    const backdrops = document.querySelectorAll(".modal-backdrop");
    if (backdrops.length > 1) {
      // Apply z-index to the last backdrop
      const lastBackdrop = backdrops[backdrops.length - 1];
      lastBackdrop.style.zIndex = "1057";
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      openSignIn();
    } else {
      addProductToCart(quickViewItem.id, quantity);
    }
  };

  const handleWishlistClick = () => {
    if (!user) {
      openSignIn();
    } else {
      addToWishlist(quickViewItem.id);
    }
  };

  return (
    <div className="modal fullRight fade modal-quick-view" id="quickView">
      <div className="modal-dialog">
        <div className="modal-content">
          <Grid5
            firstItem={quickViewItem.imgSrc}
            activeColor={activeColor}
            setActiveColor={setActiveColor}
          />
          <div className="wrap mw-100p-hidden">
            <div className="header">
              <h5 className="title">Quick View</h5>
              <span
                className="icon-close icon-close-popup"
                data-bs-dismiss="modal"
              />
            </div>
            <div className="tf-product-info-list">
              <div className="tf-product-info-heading">
                <div className="tf-product-info-name">
                  <div className="text text-btn-uppercase">Clothing</div>
                  <h3 className="name">{quickViewItem.title}</h3>
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
                        ({reviewCount} reviews)
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
                      ${quickViewItem.price.toFixed(2)}
                    </h5>
                    {quickViewItem.oldPrice ? (
                      <>
                        <div className="compare-at-price font-2">
                          {" "}
                          ${quickViewItem.oldPrice.toFixed(2)}
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
                    The garments labelled as Committed are products that have
                    been produced using sustainable fibres or processes,
                    reducing their environmental impact.
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
                <ColorSelect
                  activeColor={activeColor}
                  setActiveColor={setActiveColor}
                />
                <SizeSelect />
                <div className="tf-product-info-quantity">
                  <div className="title mb_12">Quantity:</div>
                  <QuantitySelect
                    quantity={
                      isAddedToCartProducts(quickViewItem.id)
                        ? cartProducts.filter(
                            (elm) => elm.id == quickViewItem.id
                          )[0].quantity
                        : quantity
                    }
                    setQuantity={(qty) => {
                      if (isAddedToCartProducts(quickViewItem.id)) {
                        updateQuantity(quickViewItem.id, qty);
                      } else {
                        setQuantity(qty);
                      }
                    }}
                  />
                </div>
                <div>
                  <div className="pd-btn-group">
                    <div className="group-btn">
                      <div className="product-quantity">
                        <span
                          className="product-quantity-btn decrease"
                          onClick={() =>
                            quantity > 1 && setQuantity(quantity - 1)
                          }
                        >
                          -
                        </span>
                        <input
                          type="text"
                          name="product-quantity-input"
                          className="product-quantity-input"
                          value={quantity}
                          readOnly
                        />
                        <span
                          className="product-quantity-btn increase"
                          onClick={() => setQuantity(quantity + 1)}
                        >
                          +
                        </span>
                      </div>
                      <button
                        className="tf-btn-2 btn-addtocart text-btn-uppercase"
                        onClick={handleAddToCart}
                      >
                        {user && isAddedToCartProducts(quickViewItem.id)
                          ? "Already Added"
                          : "Add to cart"}
                      </button>
                    </div>
                    <button
                      className="tf-btn btn-wishlist text-btn-uppercase"
                      onClick={handleWishlistClick}
                    >
                      {user && isAddedtoWishlist(quickViewItem.id)
                        ? "Already Wishlisted"
                        : "Wishlist"}
                    </button>
                  </div>
                  <a href="#" className="btn-style-3 text-btn-uppercase">
                    Buy it now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
