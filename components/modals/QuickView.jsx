"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import SizeSelect from "../productDetails/SizeSelect";
import ColorSelect from "../productDetails/ColorSelect";
import Grid5 from "../productDetails/grids/Grid5";
import { useContextElement } from "@/context/Context";
import QuantitySelect from "../productDetails/QuantitySelect";
import { useSession, signIn } from "next-auth/react";
import { PRODUCT_REVIEWS_API } from "../../utils/urls";
import { fetchDataFromApi } from "../../utils/api";
import { allProducts } from "@/data/productsWomen";
import Link from "next/link";

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
  const { data: session } = useSession();
  const [item, setItem] = useState(allProducts[0]);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    const filtered = allProducts.filter((el) => el.id == quickViewItem);
    if (filtered.length) {
      setItem(filtered[0]);
    }
  }, [quickViewItem]);

  useEffect(() => {
    if (item?.documentId) {
      fetchReviews(item.documentId);
    }
  }, [item]);

  const fetchReviews = async (productDocumentId) => {
    try {
      const response = await fetchDataFromApi(
        PRODUCT_REVIEWS_API(productDocumentId)
      );
      if (response?.data) {
        setReviews(response.data);
        setTotalReviews(response.data.length);
        
        // Calculate average rating
        if (response.data.length > 0) {
          const totalRating = response.data.reduce((sum, review) => sum + review.rating, 0);
          setAverageRating(totalRating / response.data.length);
        } else {
          setAverageRating(0);
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="icon-star" />);
    }

    if (hasHalfStar) {
      stars.push(<i key="half" className="icon-star-half" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<i key={`empty-${i}`} className="icon-star-o" />);
    }

    return stars;
  };

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
      signIn();
    } else {
      addProductToCart(item.id, quantity);
    }
  };

  const handleWishlistClick = () => {
    if (!user) {
      signIn();
    } else {
      addToWishlist(item.id);
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
    const mainImageUrl = getImageUrlString(item.imgSrc);
    if (mainImageUrl) {
      imageGallery.push({
        id: 1,
        url: mainImageUrl,
        alt: item.title || 'Product main image'
      });
    }
    
    // 2. Add hover image second (if different from main)
    const hoverImageUrl = getImageUrlString(item.imgHover);
    if (hoverImageUrl && hoverImageUrl !== mainImageUrl) {
      imageGallery.push({
        id: 2,
        url: hoverImageUrl,
        alt: item.title || 'Product hover image'
      });
    }
    
    // 3. Add gallery images if available
    if (item.gallery && item.gallery.length > 0) {
      item.gallery.forEach((img, index) => {
        const galleryImageUrl = getImageUrlString(img);
        if (galleryImageUrl && !imageGallery.some(existing => existing.url === galleryImageUrl)) {
          imageGallery.push({
            id: index + 10,
            url: galleryImageUrl,
            alt: img.alt || `${item.title} - Gallery image ${index + 1}`
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
            firstItem={item.imgSrc}
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
                  <h3 className="name">{item.title}</h3>
                  <div className="sub">
                    <div className="tf-product-info-rate">
                      <div className="list-star">
                        {renderStars(averageRating)}
                      </div>
                      <div className="text text-caption-1">
                        ({totalReviews} reviews)
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
                      ${item.price.toFixed(2)}
                    </h5>
                    {item.oldPrice ? (
                      <>
                        <div className="compare-at-price font-2">
                          {" "}
                          ${item.oldPrice.toFixed(2)}
                        </div>
                        <div className="badges-on-sale text-btn-uppercase">
                          -{((item.oldPrice - item.price) / item.oldPrice * 100).toFixed(2)}%
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
                      <span className="liveview-count">{totalReviews}</span> people are
                      viewing this right now
                    </p>
                  </div>
                </div>
              </div>
              <div className="tf-product-info-choose-option">
                {/* Sizes section */}
                {item.sizes && item.sizes.length > 0 && (
                  <div className="tf-product-info-size">
                    <SizeSelect 
                      sizes={
                        item.sizes.map((size, index) => ({
                          id: `values-${typeof size === 'string' ? size.toLowerCase() : size}-${index}`,
                          value: typeof size === 'string' ? size : size,
                          price: item.price,
                          disabled: false
                        }))
                      }
                    />
                  </div>
                )}

                {/* Colors section */}
                {item.colors && item.colors.length > 0 && (
                  <div className="tf-product-info-color" style={{ position: 'relative', left: '-8px', width: '100%' }}>
                    <ColorSelect
                      activeColor={activeColor}
                      setActiveColor={setActiveColor}
                      colorOptions={
                        item.colors.map((color, index) => {
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
                          {user && isAddedToCartProducts(item.id)
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
