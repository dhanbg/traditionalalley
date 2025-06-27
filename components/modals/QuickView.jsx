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

  // Update activeColor when quickViewItem changes
  useEffect(() => {
    if (quickViewItem?.colors && quickViewItem.colors.length > 0) {
      const firstColor = typeof quickViewItem.colors[0] === 'string' 
        ? quickViewItem.colors[0]
        : quickViewItem.colors[0].name || "Gray";
      setActiveColor(firstColor);
    } else {
      setActiveColor("Gray");
    }
  }, [quickViewItem]);

  const openModalSizeChoice = async () => {
    try {
      const bootstrap = await import("bootstrap/dist/js/bootstrap.esm.js");
      
      // Check if Modal is available
      const Modal = bootstrap.Modal || bootstrap.default?.Modal;
      if (!Modal) {
        console.error("Bootstrap Modal is not available");
        return;
      }
      
      const sizeGuideElement = document.getElementById("size-guide");
      if (!sizeGuideElement) {
        console.error("Size guide modal element not found");
        return;
      }
      
      const myModal = new Modal(sizeGuideElement, {
        keyboard: false,
      });

      myModal.show();
      sizeGuideElement.addEventListener("hidden.bs.modal", () => {
        myModal.hide();
      });
      
      const backdrops = document.querySelectorAll(".modal-backdrop");
      if (backdrops.length > 1) {
        // Apply z-index to the last backdrop
        const lastBackdrop = backdrops[backdrops.length - 1];
        lastBackdrop.style.zIndex = "1057";
      }
    } catch (error) {
      console.error("Error opening size guide modal:", error);
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

  // Create fallback gallery if product doesn't have gallery images
  const getProductImages = () => {
    // Helper function to get proper image URL string
    const getImageUrlString = (imageObj) => {
      if (!imageObj) return null;
      
      if (typeof imageObj === 'string') {
        return imageObj;
      }
      
      if (imageObj.url) {
        return imageObj.url;
      }
      
      if (imageObj.src) {
        return imageObj.src;
      }
      
      return null;
    };

    // Always prioritize main image and hover image first
    const imageGallery = [];
    
    // 1. Add main image first
    const mainImageUrl = getImageUrlString(quickViewItem.imgSrc);
    if (mainImageUrl) {
      imageGallery.push({
        id: 1,
        url: mainImageUrl,
        alt: quickViewItem.title || 'Product main image'
      });
    }
    
    // 2. Add hover image second (if different from main)
    const hoverImageUrl = getImageUrlString(quickViewItem.imgHover);
    if (hoverImageUrl && hoverImageUrl !== mainImageUrl) {
      imageGallery.push({
        id: 2,
        url: hoverImageUrl,
        alt: quickViewItem.title || 'Product hover image'
      });
    }
    
    // 3. Add gallery images if available
    if (quickViewItem.gallery && quickViewItem.gallery.length > 0) {
      quickViewItem.gallery.forEach((img, index) => {
        const galleryImageUrl = getImageUrlString(img);
        if (galleryImageUrl && !imageGallery.some(existing => existing.url === galleryImageUrl)) {
          imageGallery.push({
            id: index + 10,
            url: galleryImageUrl,
            alt: img.alt || `${quickViewItem.title} - Gallery image ${index + 1}`
          });
        }
      });
    }
    
    return imageGallery;
  };

  return (
    <div className="modal fullRight fade modal-quick-view" id="quickView">
      <div className="modal-dialog">
        <div className="modal-content">
          <Grid5
            firstItem={quickViewItem.imgSrc}
            activeColor={activeColor}
            setActiveColor={setActiveColor}
            productImages={getProductImages()}
          />
          <div className="wrap mw-100p-hidden" style={{ maxWidth: '500px', margin: '0', padding: '32px 24px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div className="header" style={{ width: '100%' }}>
              <h5 className="title">Quick View</h5>
              <span
                className="icon-close icon-close-popup"
                data-bs-dismiss="modal"
              />
            </div>
            <div className="tf-product-info-list" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
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
                          -{((quickViewItem.oldPrice - quickViewItem.price) / quickViewItem.oldPrice * 100).toFixed(2)}%
                        </div>
                      </>
                    ) : (
                      ""
                    )}
                  </div>
                  {/* Sustainability information: Explains what "Committed" label means for eco-friendly products */}
                  {/* <p>
                    The garments labelled as Committed are products that have
                    been produced using sustainable fibres or processes,
                    reducing their environmental impact.
                  </p> */}
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
                {/* Sizes section */}
                {quickViewItem.sizes && quickViewItem.sizes.length > 0 && (
                  <div className="tf-product-info-size">
                    <SizeSelect 
                      sizes={
                        quickViewItem.sizes.map((size, index) => ({
                          id: `values-${typeof size === 'string' ? size.toLowerCase() : size}-${index}`,
                          value: typeof size === 'string' ? size : size,
                          price: quickViewItem.price,
                          disabled: false
                        }))
                      }
                    />
                  </div>
                )}

                {/* Colors section */}
                {quickViewItem.colors && quickViewItem.colors.length > 0 && (
                  <div className="tf-product-info-color" style={{ position: 'relative', left: '-8px', width: '100%' }}>
                    <ColorSelect
                      activeColor={activeColor}
                      setActiveColor={setActiveColor}
                      colorOptions={
                        quickViewItem.colors.map((color, index) => {
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

                <div>
                  <div className="pd-btn-group" style={{ display: 'flex', justifyContent: 'flex-start', gap: '10px', marginTop: '20px' }}>
                    <div className="group-btn" style={{ width: '100%' }}>
                      <button
                        className="btn-style-2 fw-6 btn-add-to-cart"
                        onClick={handleAddToCart}
                        style={{ 
                          height: "46px", 
                          display: "flex", 
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0 30px",
                          minWidth: "180px",
                          width: "100%",
                          fontSize: "14px",
                          fontWeight: "600",
                          borderRadius: "4px"
                        }}
                      >
                        <span>
                          {user && isAddedToCartProducts(quickViewItem.id)
                            ? "Added"
                            : "Add to cart"}
                        </span>
                      </button>
                    </div>
                  </div>
                  {/* <a href="#" className="btn-style-3 text-btn-uppercase">
                    Buy it now
                  </a> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
