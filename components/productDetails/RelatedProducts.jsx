"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import ProductCard1 from "../productCards/ProductCard1";
import { fetchDataFromApi } from "@/utils/api";
import { getBestImageUrl } from "@/utils/imageUtils";
import { fetchProductsWithVariantsByCategory, fetchSingleProductWithVariants } from "@/utils/productVariantUtils";


// Default placeholder image
const DEFAULT_IMAGE = '/logo.png';

// Helper function to transform product data to ensure valid image URLs and required fields
const transformProduct = (rawProduct) => {
  if (!rawProduct) return null;
  
  // Extract image URLs with proper formatting
  let imgSrc = DEFAULT_IMAGE;
   
  // Use utility function to get the best image URL
  if (rawProduct.attributes?.imgSrc?.data?.attributes) {
    imgSrc = getBestImageUrl(rawProduct.attributes.imgSrc.data.attributes, 'medium') || DEFAULT_IMAGE;
  } else if (rawProduct.imgSrc) {
    if (typeof rawProduct.imgSrc === 'string') {
      imgSrc = rawProduct.imgSrc;
    } else {
      imgSrc = getBestImageUrl(rawProduct.imgSrc, 'medium') || DEFAULT_IMAGE;
    }
  }
  
  // Handle hover image similarly
  let imgHover = imgSrc; // Default to main image
  
  if (rawProduct.attributes?.imgHover?.data?.attributes) {
    imgHover = getBestImageUrl(rawProduct.attributes.imgHover.data.attributes, 'medium') || imgSrc;
  } else if (rawProduct.imgHover) {
    if (typeof rawProduct.imgHover === 'string') {
      imgHover = rawProduct.imgHover;
    } else {
      imgHover = getBestImageUrl(rawProduct.imgHover, 'medium') || imgSrc;
    }
  }
  
  // Ensure we have a valid ID
  const id = rawProduct.documentId || rawProduct.id || rawProduct.attributes?.id || 0;
  
  // Create the product object first
  const productObj = {
    ...rawProduct,
    id,
    documentId: id,
    imgSrc,
    imgHover,
    title: rawProduct.title || rawProduct.attributes?.title || "Untitled Product",
    price: rawProduct.price || rawProduct.attributes?.price || 0,
    oldPrice: rawProduct.oldPrice || rawProduct.attributes?.oldPrice || null,
    isOnSale: !!rawProduct.oldPrice || !!rawProduct.attributes?.oldPrice,
    salePercentage: rawProduct.salePercentage || rawProduct.attributes?.salePercentage || "25%",
    weight: rawProduct.weight || rawProduct.attributes?.weight || null,
    size_stocks: rawProduct.size_stocks || rawProduct.attributes?.size_stocks
  };
  
  // Use isActive from the API - treat null or undefined as inactive
  productObj.isActive = rawProduct.isActive === true;
  
  return productObj;
};

export default function RelatedProducts({ product, initialRelatedProducts = [] }) {
  const [relatedProducts, setRelatedProducts] = useState(initialRelatedProducts);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(!initialRelatedProducts || initialRelatedProducts.length === 0);

  useEffect(() => {
    // Function to fetch related products if not already supplied by server
    const fetchRelatedProducts = async () => {
      if (!product) return;
      if (initialRelatedProducts && initialRelatedProducts.length > 0) {
        setRelatedProducts(initialRelatedProducts);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        let productsWithVariants = [];
        
        if (product.category && product.category.title) {
          productsWithVariants = await fetchProductsWithVariantsByCategory(product.category.title, 10);
        } else {
          const response = await fetchDataFromApi(`/api/products?pagination[limit]=4&populate=*`);
          if (response.data) {
            productsWithVariants = response.data.map(transformProduct)
              .filter(Boolean)
              .filter(p => p.isActive === true);
          }
        }
        
        const filteredProducts = productsWithVariants.filter(item => 
          item.id !== product.id && item.parentProductId !== product.id
        );
        const activeItems = filteredProducts.filter(item => item.isActive !== false);
        
        setRelatedProducts(activeItems.slice(0, 8));
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    
    // Store preview items in localStorage for instant rendering without extra API calls
    const getRecentlyViewedProducts = () => {
      try {
        if (!product || !product.id) return;
        
        const currentPreview = {
          id: product.id,
          documentId: product.documentId || product.id,
          title: product.title,
          price: product.price,
          oldPrice: product.oldPrice,
          imgSrc: product.imgSrc,
          imgHover: product.imgHover,
          isActive: product.isActive !== false,
          inStock: product.inStock,
        };

        const stored = JSON.parse(localStorage.getItem('recentlyViewedItems')) || [];
        const filtered = Array.isArray(stored)
          ? stored.filter(item => item && item.id && item.id !== product.id && item.documentId !== product.documentId)
          : [];
        const updated = [currentPreview, ...filtered].slice(0, 10);
        localStorage.setItem('recentlyViewedItems', JSON.stringify(updated));

        const displayItems = updated
          .filter(item => item.id !== product.id && item.isActive !== false)
          .slice(0, 8);
        setRecentlyViewed(displayItems);
      } catch (error) {
        // Silently handle localStorage errors
      }
    };
    
    fetchRelatedProducts();
    
    if (typeof window !== 'undefined') {
      getRecentlyViewedProducts();
    }
  }, [product, initialRelatedProducts]);

  return (
    <section className="flat-spacing">
      <div className="container flat-animate-tab">
        <ul
          className="tab-product justify-content-sm-center wow fadeInUp"
          data-wow-delay="0s"
          role="tablist"
        >
          <li className="nav-tab-item" role="presentation">
            <a href="#relatedProducts" className="active" data-bs-toggle="tab">
              Related Products
            </a>
          </li>
          <li className="nav-tab-item" role="presentation">
            <a href="#recentlyViewed" data-bs-toggle="tab">
              Recently Viewed
            </a>
          </li>
        </ul>
        <div className="tab-content">
          <div
            className="tab-pane active show"
            id="relatedProducts"
            role="tabpanel"
          >
            {loading ? (
              <div className="tf-grid-layout wrapper-shop tf-col-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="card-product skeleton-card">
                    <div className="card-product-wrapper skeleton-media">
                      <div className="shimmer-effect" />
                    </div>
                    <div className="card-product-info">
                      <div className="skeleton-title shimmer-effect" />
                      <div className="skeleton-price shimmer-effect" />
                    </div>
                  </div>
                ))}
                <style jsx>{`
                  .skeleton-card {
                    pointer-events: none;
                    box-shadow: none !important;
                    background: transparent !important;
                  }

                  .skeleton-media {
                    background: #f0f2f5 !important;
                    position: relative;
                    overflow: hidden;
                    aspect-ratio: 3/4;
                    border-radius: 12px;
                  }

                  :global(html.dark) .skeleton-media {
                    background: #1a1d26 !important;
                  }

                  .skeleton-title {
                    height: 18px;
                    width: 70%;
                    background: #f0f2f5;
                    border-radius: 4px;
                    margin-top: 12px;
                    margin-bottom: 8px;
                  }

                  :global(html.dark) .skeleton-title {
                    background: #1a1d26;
                  }

                  .skeleton-price {
                    height: 14px;
                    width: 40%;
                    background: #f0f2f5;
                    border-radius: 4px;
                  }

                  :global(html.dark) .skeleton-price {
                    background: #1a1d26;
                  }

                  .shimmer-effect {
                    position: relative;
                    overflow: hidden;
                    width: 100%;
                    height: 100%;
                  }

                  .shimmer-effect::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                      90deg,
                      rgba(255, 255, 255, 0) 0%,
                      rgba(255, 255, 255, 0.6) 50%,
                      rgba(255, 255, 255, 0) 100%
                    );
                    animation: shimmer 1.5s infinite;
                  }

                  :global(html.dark) .shimmer-effect::after {
                    background: linear-gradient(
                      90deg,
                      rgba(255, 255, 255, 0) 0%,
                      rgba(255, 255, 255, 0.06) 50%,
                      rgba(255, 255, 255, 0) 100%
                    );
                  }

                  @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                  }
                `}</style>
              </div>
            ) : relatedProducts.length > 0 ? (
            <Swiper
              className="swiper tf-sw-latest"
              dir="ltr"
              spaceBetween={15}
              breakpoints={{
                0: { slidesPerView: 2, spaceBetween: 15 },
                768: { slidesPerView: 3, spaceBetween: 30 },
                1200: { slidesPerView: 4, spaceBetween: 30 },
              }}
              modules={[Pagination]}
              pagination={{
                clickable: true,
                el: ".spd4",
              }}
            >
                {relatedProducts.map((relatedProduct, i) => (
                <SwiperSlide key={i} className="swiper-slide">
                    <ProductCard1 product={relatedProduct} />
                </SwiperSlide>
              ))}
                <div className="sw-pagination-latest spd4 sw-dots type-circle justify-content-center" />
            </Swiper>
            ) : (
              <div className="text-center py-4">No related products found</div>
            )}
          </div>
          <div className="tab-pane" id="recentlyViewed" role="tabpanel">
            {recentlyViewed.length > 0 ? (
            <Swiper
              className="swiper tf-sw-latest"
              dir="ltr"
              spaceBetween={15}
              breakpoints={{
                0: { slidesPerView: 2, spaceBetween: 15 },
                768: { slidesPerView: 3, spaceBetween: 30 },
                1200: { slidesPerView: 4, spaceBetween: 30 },
              }}
              modules={[Pagination]}
              pagination={{
                clickable: true,
                el: ".spd5",
              }}
            >
                {recentlyViewed.map((viewedProduct, i) => (
                <SwiperSlide key={i} className="swiper-slide">
                    <ProductCard1 product={viewedProduct} />
                </SwiperSlide>
              ))}
                <div className="sw-pagination-latest spd5 sw-dots type-circle justify-content-center" />
            </Swiper>
            ) : (
              <div className="text-center py-4">No recently viewed products</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
