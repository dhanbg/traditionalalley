import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import Breadcumb from "@/components/productDetails/Breadcumb";
import Descriptions1 from "@/components/productDetails/descriptions/Descriptions1";
import Details1 from "@/components/productDetails/details/Details1";
import RelatedProducts from "@/components/productDetails/RelatedProducts";
import { fetchDataFromApi } from "@/utils/api";
import { PRODUCTS_API } from "@/utils/urls";
import React from "react";
import { allProducts } from "@/data/productsWomen";

export const metadata = {
  title:
    "Product Detail || Traditional Alley",
  description: "Traditional Alley",
};

// Helper function to format product image URLs
const getImageUrl = (imageObj, preferLarge = true) => {
  if (!imageObj) return '/images/placeholder.jpg';
  
  let imageUrl = '';
  
  // Get URL from formats or fallback to original
  if (imageObj.formats) {
    if (preferLarge && imageObj.formats.large) {
      imageUrl = imageObj.formats.large.url;
    } else if (imageObj.formats.small) {
      imageUrl = imageObj.formats.small.url;
    }
  }
  
  // Fallback to original URL if formats not available
  if (!imageUrl && imageObj.url) {
    imageUrl = imageObj.url;
  }
  
  // Ensure URL is absolute
  if (!imageUrl) return '/images/placeholder.jpg';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `https://admin.traditionalalley.com.np${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
};

export default async function page({ params }) {
  const { id } = await params;
  
  // Fetch product data from backend API
  let product;
  try {
    // Try to fetch from backend first
    let backendSuccess = false;
    
    try {
      // Use the products API with a filter instead of direct ID lookup
      const response = await fetchDataFromApi(`${PRODUCTS_API}&filters[id][$eq]=${id}`);
      
      if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
        const productData = response.data[0];
        
        // Check if we have attributes in the response (Strapi v4 format)
        if (productData.attributes) {
          product = {
            id: productData.id || id,
            title: productData.attributes.title || "Unknown Product",
            price: productData.attributes.price || 0,
            oldPrice: productData.attributes.oldPrice || null,
            imgSrc: getImageUrl(productData.attributes.imgSrc?.data),
            imgHover: getImageUrl(productData.attributes.imgHover?.data),
            isOnSale: Boolean(productData.attributes.isOnSale),
            salePercentage: productData.attributes.salePercentage || null,
            hotSale: Boolean(productData.attributes.hotSale),
            inStock: Boolean(productData.attributes.inStock),
            countdown: productData.attributes.countdown || null,
            filterBrands: productData.attributes.filterBrands || [],
            filterColor: productData.attributes.filterColor || [],
            filterSizes: productData.attributes.filterSizes || [],
            tabFilterOptions: productData.attributes.tabFilterOptions || [],
            tabFilterOptions2: productData.attributes.tabFilterOptions2 || [],
            colors: productData.attributes.colors || [],
            sizes: productData.attributes.sizes || [],
            slug: productData.attributes.slug || '',
          };
        } else {
          // Direct data format (possibly Strapi v3 or custom API)
          product = {
            id: productData.id || id,
            title: productData.title || "Unknown Product",
            price: productData.price || 0,
            oldPrice: productData.oldPrice || null,
            imgSrc: getImageUrl(productData.imgSrc),
            imgHover: getImageUrl(productData.imgHover),
            isOnSale: Boolean(productData.isOnSale),
            salePercentage: productData.salePercentage || null,
            hotSale: Boolean(productData.hotSale),
            inStock: Boolean(productData.inStock),
            countdown: productData.countdown || null,
            filterBrands: productData.filterBrands || [],
            filterColor: productData.filterColor || [],
            filterSizes: productData.filterSizes || [],
            tabFilterOptions: productData.tabFilterOptions || [],
            tabFilterOptions2: productData.tabFilterOptions2 || [],
            colors: productData.colors || [],
            sizes: productData.sizes || [],
            slug: productData.slug || '',
          };
        }
        backendSuccess = true;
      }
    } catch (apiError) {
      console.error("Error fetching from API:", apiError);
      // Continue to fallback
    }
    
    // If backend fetch failed, fall back to local data
    if (!backendSuccess) {
      // Fallback to local data if API fails
      const localProduct = allProducts.filter((p) => p.id == id)[0] || allProducts[0];
      console.log("Using local data fallback for product:", id);
      product = localProduct;
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    // Use a fallback or redirect if needed
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <p>Sorry, we couldn't find the product you're looking for.</p>
      </div>
    );
  }

  return (
    <>
      <Topbar6 bgColor="bg-main" />
      <Header1 />
      <Breadcumb product={product} />
      <Details1 product={product} />
      <Descriptions1 />
      <RelatedProducts />
      <Footer1 hasPaddingBottom />
    </>
  );
}
