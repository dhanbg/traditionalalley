"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import ProductCard1 from "../productCards/ProductCard1";
import { fetchDataFromApi } from "@/utils/api";
import { getBestImageUrl } from "@/utils/imageUtils";

// Default placeholder image
const DEFAULT_IMAGE = '/images/placeholder.jpg';

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
  
  return {
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
    weight: rawProduct.weight || rawProduct.attributes?.weight || null
  };
};

export default function RelatedProducts({ product }) {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to fetch related products
    const fetchRelatedProducts = async () => {
      if (!product) return;
      
      try {
        setLoading(true);
        
        // Get products from the same category or collection as the current product
        let query = '';
        
        if (product.category && product.category.id) {
          // Filter by category id
          query = `/api/products?filters[category][id][$eq]=${product.category.id}&filters[documentId][$ne]=${product.id}&populate=*`;
        } else if (product.collection && product.collection.id) {
          // Filter by collection id
          query = `/api/products?filters[collection][id][$eq]=${product.collection.id}&filters[documentId][$ne]=${product.id}&populate=*`;
        } else {
          // Fallback to any products
          query = `/api/products?pagination[limit]=4&populate=*`;
        }
        
        const response = await fetchDataFromApi(query);
        
        if (response.data) {
          // Transform products to ensure valid image URLs
          const transformedProducts = response.data.map(transformProduct)
            .filter(Boolean); // Remove any nulls
          
          setRelatedProducts(transformedProducts);
        }
        
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    
    // Function to get recently viewed products from localStorage
    const getRecentlyViewedProducts = async () => {
      try {
        // Get recently viewed product IDs from localStorage
        const recentlyViewedIds = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
        
        // Ensure current product is first in recently viewed
        if (product && product.id) {
          // Remove current product if it exists in the array
          const filteredIds = recentlyViewedIds.filter(id => id !== product.id);
          
          // Add current product to the beginning
          const updatedIds = [product.id, ...filteredIds].slice(0, 10); // Keep only 10 items
          
          // Save back to localStorage
          localStorage.setItem('recentlyViewed', JSON.stringify(updatedIds));
          
          // Fetch product data for each ID (excluding current product)
          const productPromises = updatedIds
            .filter(id => id !== product.id) // Exclude current product
            .slice(0, 4) // Limit to 4 products
            .map(id => fetchDataFromApi(`/api/products?filters[documentId][$eq]=${id}&populate=*`));
          
          if (productPromises.length > 0) {
            const responses = await Promise.all(productPromises);
            
            // Extract product data from responses and transform to ensure valid image URLs
            const fetchedProducts = responses
              .filter(response => response && response.data && response.data.length > 0)
              .map(response => transformProduct(response.data[0]))
              .filter(Boolean); // Remove any nulls
            
            setRecentlyViewed(fetchedProducts);
          }
        }
      } catch (error) {
      }
    };
    
    fetchRelatedProducts();
    
    // Only run in browser environment since it uses localStorage
    if (typeof window !== 'undefined') {
      getRecentlyViewedProducts();
    }
  }, [product]);

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
              <div className="text-center py-4">Loading related products...</div>
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
