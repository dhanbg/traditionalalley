"use client";
import React, { useState, useEffect } from "react";
import { fetchDataFromApi } from "@/utils/api";
import { HERO_SLIDES_API, PRODUCT_BY_DOCUMENT_ID_API } from "@/utils/urls";
import { fetchProductsWithVariants } from "@/utils/productVariantUtils";
import ProductCard1 from "@/components/productCards/ProductCard1";

export default function HeroProducts({ slideId, btnText }) {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);



  useEffect(() => {
    const fetchHeroSlideProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch hero slides data
        const heroSlidesResponse = await fetchDataFromApi(HERO_SLIDES_API);
        
        if (!heroSlidesResponse?.data) {
          setError("No hero slides data found");
          setLoading(false);
          return;
        }
        
        // Find the target slide based on slideId or btnText
        let targetSlide = null;
        
        if (slideId) {
          targetSlide = heroSlidesResponse.data.find(slide => 
            slide.documentId === slideId || slide.id === slideId
          );
        } else if (btnText) {
          targetSlide = heroSlidesResponse.data.find(slide => 
            slide.btnText === btnText
          );
        }
        
        if (!targetSlide) {
          setError(`No matching slide found for: ${slideId || btnText}`);
          setLoading(false);
          return;
        }
        
        // Check if the slide has products
        if (!targetSlide.products || !Array.isArray(targetSlide.products) || targetSlide.products.length === 0) {
          setError("No products found in target slide");
          setLoading(false);
          return;
        }
        
        // Get product IDs from hero slide
        const productIds = targetSlide.products.map(productRef => 
          productRef.documentId || productRef.id
        ).filter(Boolean);
        
        if (productIds.length === 0) {
           setProducts([]);
           setLoading(false);
           return;
         }
        
        // Fetch all products with their variants
        const allProductsWithVariants = [];
        
        for (const productId of productIds) {
          try {
            const apiEndpoint = `/api/products?filters[documentId][$eq]=${productId}&populate=*`;
            const productsWithVariants = await fetchProductsWithVariants(apiEndpoint);
            allProductsWithVariants.push(...productsWithVariants);
          } catch (error) {
            console.error(`Error fetching product with variants for ID ${productId}:`, error);
          }
        }
        
        setProducts(allProductsWithVariants);
        setLoading(false);
        
      } catch (error) {
        console.error("Error in fetchHeroSlideProducts:", error);
        setError(`Error fetching products: ${error.message}`);
        setLoading(false);
      }
    };
    
    fetchHeroSlideProducts();
  }, [slideId, btnText]);
  
  if (loading) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="text-center py-8">
            <div className="spinner-border" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-2">Loading hero products...</p>
          </div>
        </div>
      </section>
    );
  }
  
  if (error) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </section>
    );
  }
  
  if (!products || products.length === 0) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">No Products Found</h2>
            <p>No products were found for the selected hero slide.</p>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="flat-spacing">
      <div className="container">
        <div className="wrapper-control-shop">
          <div className="tf-grid-layout wrapper-shop tf-col-4" id="gridLayout">
            {products.map((product, index) => (
              <ProductCard1 key={product.documentId || product.id || index} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}