"use client";
import React, { useState, useEffect } from "react";
import { fetchDataFromApi } from "@/utils/api";
import { HERO_SLIDES_API, PRODUCT_BY_DOCUMENT_ID_API } from "@/utils/urls";
import { fetchProductsWithVariants } from "@/utils/productVariantUtils";
import ProductCard1 from "@/components/productCards/ProductCard1";

export default function HeroProducts({ slideId, btnText, videoName }) {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);



  useEffect(() => {
    const fetchHeroSlideProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // If a videoName is provided, first resolve the hero slide by videoName
        if (videoName) {
          try {
            const baseFileName = videoName.split('/').pop();
            const nameWithoutExt = baseFileName?.replace(/\.[^/.]+$/, '') || baseFileName;

            // Try strict equality on full name
            const heroByVideoEndpointEqFull = `/api/hero-slides?filters[videoName][$eq]=${encodeURIComponent(baseFileName)}&populate=*`;
            let heroByVideoResp = await fetchDataFromApi(heroByVideoEndpointEqFull);

            // If not found, try equality without extension
            if (!heroByVideoResp?.data || heroByVideoResp.data.length === 0) {
              const heroByVideoEndpointEqNoExt = `/api/hero-slides?filters[videoName][$eq]=${encodeURIComponent(nameWithoutExt)}&populate=*`;
              heroByVideoResp = await fetchDataFromApi(heroByVideoEndpointEqNoExt);
            }

            // If still not found, try case-insensitive contains
            if (!heroByVideoResp?.data || heroByVideoResp.data.length === 0) {
              const heroByVideoEndpointContains = `/api/hero-slides?filters[videoName][$containsi]=${encodeURIComponent(nameWithoutExt)}&populate=*`;
              heroByVideoResp = await fetchDataFromApi(heroByVideoEndpointContains);
            }

            if (heroByVideoResp?.data && heroByVideoResp.data.length > 0) {
              const targetSlide = heroByVideoResp.data[0];

              // If slide has explicit products relation, use that mapping
              if (targetSlide.products && Array.isArray(targetSlide.products) && targetSlide.products.length > 0) {
                const productIds = targetSlide.products
                  .map(p => p.documentId || p.id)
                  .filter(Boolean);

                if (productIds.length > 0) {
                  const allProductsWithVariants = [];
                  for (const productId of productIds) {
                    try {
                      const apiEndpoint = `/api/products?filters[documentId][$eq]=${productId}&populate=*`;
                      const pwv = await fetchProductsWithVariants(apiEndpoint);
                      allProductsWithVariants.push(...pwv);
                    } catch (error) {
                      console.error(`Error fetching product with variants for ID ${productId}:`, error);
                    }
                  }
                  setProducts(allProductsWithVariants);
                  setLoading(false);
                  return;
                }
              }

              // Fallback: if no explicit products relation, try product search by videoName on products
              try {
                // Try matching products by videoName field if present
                const productEqFull = `/api/products?filters[videoName][$eq]=${encodeURIComponent(baseFileName)}&populate=*`;
                let productsWithVariants = await fetchProductsWithVariants(productEqFull);

                if (!productsWithVariants || productsWithVariants.length === 0) {
                  const productEqNoExt = `/api/products?filters[videoName][$eq]=${encodeURIComponent(nameWithoutExt)}&populate=*`;
                  productsWithVariants = await fetchProductsWithVariants(productEqNoExt);
                }

                if (!productsWithVariants || productsWithVariants.length === 0) {
                  const productContains = `/api/products?filters[videoName][$containsi]=${encodeURIComponent(nameWithoutExt)}&populate=*`;
                  productsWithVariants = await fetchProductsWithVariants(productContains);
                }
                if (productsWithVariants.length > 0) {
                  setProducts(productsWithVariants);
                  setLoading(false);
                  return;
                }
              } catch (vnError) {
                console.error("Error fetching products by videoName:", vnError);
              }
            }
            // If nothing found by videoName, continue to legacy slide mapping below
          } catch (vnSlideError) {
            console.error("Error resolving hero slide by videoName:", vnSlideError);
            // Fall through to legacy slide mapping
          }
        }

        // Legacy: Fetch hero slides data and map products via slide.products
        const heroSlidesResponse = await fetchDataFromApi(HERO_SLIDES_API);
        
        if (!heroSlidesResponse?.data) {
          setError("No hero slides data found");
          setLoading(false);
          return;
        }
        
        // Find the target slide based on slideId, btnText, or videoName (client-side match)
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

        // If still not found and we have a videoName, try matching by videoName or mobileMedia.name
        if (!targetSlide && videoName) {
          const baseFileName = videoName.split('/').pop();
          const nameWithoutExt = baseFileName?.replace(/\.[^/.]+$/, '') || baseFileName;

          // Try several matching strategies
          targetSlide = heroSlidesResponse.data.find(slide => {
            const slideVideoName = slide.videoName || '';
            const mobileName = slide.mobileMedia?.name || slide.media?.name || '';
            const mobileNameNoExt = mobileName.replace(/\.[^/.]+$/, '') || mobileName;
            return (
              slideVideoName === baseFileName ||
              slideVideoName === nameWithoutExt ||
              slideVideoName?.toLowerCase().includes(nameWithoutExt?.toLowerCase()) ||
              mobileName === baseFileName ||
              mobileNameNoExt === nameWithoutExt ||
              mobileName?.toLowerCase().includes(nameWithoutExt?.toLowerCase())
            );
          });
        }
        
        if (!targetSlide) {
          setError(`No matching slide found for: ${slideId || btnText || videoName}`);
          setLoading(false);
          return;
        }
        
        // Check if the slide has products
        if (!targetSlide.products || !Array.isArray(targetSlide.products) || targetSlide.products.length === 0) {
          // Fallback again: attempt product search by videoName if available
          if (videoName) {
            try {
              const baseFileName = videoName.split('/').pop();
              const nameWithoutExt = baseFileName?.replace(/\.[^/.]+$/, '') || baseFileName;

              const productEqFull = `/api/products?filters[videoName][$eq]=${encodeURIComponent(baseFileName)}&populate=*`;
              let productsWithVariants = await fetchProductsWithVariants(productEqFull);

              if (!productsWithVariants || productsWithVariants.length === 0) {
                const productEqNoExt = `/api/products?filters[videoName][$eq]=${encodeURIComponent(nameWithoutExt)}&populate=*`;
                productsWithVariants = await fetchProductsWithVariants(productEqNoExt);
              }

              if (!productsWithVariants || productsWithVariants.length === 0) {
                const productContains = `/api/products?filters[videoName][$containsi]=${encodeURIComponent(nameWithoutExt)}&populate=*`;
                productsWithVariants = await fetchProductsWithVariants(productContains);
              }

              if (productsWithVariants && productsWithVariants.length > 0) {
                setProducts(productsWithVariants);
                setLoading(false);
                return;
              }
            } catch (err) {
              console.error('Error during fallback product search by videoName:', err);
            }
          }

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
  }, [slideId, btnText, videoName]);
  
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