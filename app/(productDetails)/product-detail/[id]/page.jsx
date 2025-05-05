import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import Breadcumb from "@/components/productDetails/Breadcumb";
import Descriptions1 from "@/components/productDetails/descriptions/Descriptions1";

import Details1 from "@/components/productDetails/details/Details1";
import RelatedProducts from "@/components/productDetails/RelatedProducts";
import { fetchDataFromApi } from "@/utils/api";
import { API_URL } from "@/utils/urls";
import React from "react";

export const metadata = {
  title: "Product Detail || Traditional Alley",
  description: "Traditional Alley - Product Detail Page",
};

export default async function page({ params }) {
  const { id } = await params;
  
  // Fetch product by documentId
  const response = await fetchDataFromApi(`/api/products?filters[documentId][$eq]=${id}&populate=*`);
  let product = null;
  
  if (response.data && response.data.length > 0) {
    const rawProduct = response.data[0];
    
    // Transform API response to match the expected format
    product = transformProduct(rawProduct);
  }
  
  if (!product) {
    // Handle case when product is not found
    return (
      <>
        <Topbar6 bgColor="bg-main" />
        <Header1 />
        <div className="container py-5 text-center">
          <h2>Product not found</h2>
          <p>Sorry, the product you are looking for does not exist or has been removed.</p>
        </div>
        <Footer1 hasPaddingBottom />
      </>
    );
  }
  
  return (
    <>
      <Topbar6 bgColor="bg-main" />
      <Header1 />
      <Breadcumb product={product} />
      {product && <Details1 product={product} />}
      <Descriptions1 product={product} />
      <RelatedProducts product={product} />
      <Footer1 hasPaddingBottom />
    </>
  );
}

// Helper function to transform API product to the expected format
function transformProduct(rawProduct) {
  if (!rawProduct) return null;
  
  // Pass through the original imgSrc object
  const imgSrc = rawProduct.imgSrc || '/vercel.svg';
  
  // Handle hover image: prefer medium, then small, then original
  let imgHover = imgSrc; // Default to main image
  if (rawProduct.imgHover) {
    if (rawProduct.imgHover.formats && rawProduct.imgHover.formats.medium) {
      imgHover = `${API_URL}${rawProduct.imgHover.formats.medium.url}`;
    } else if (rawProduct.imgHover.formats && rawProduct.imgHover.formats.small) {
      imgHover = `${API_URL}${rawProduct.imgHover.formats.small.url}`;
    } else if (rawProduct.imgHover.url && rawProduct.imgHover.url.startsWith('http')) {
      imgHover = rawProduct.imgHover.url;
    } else if (rawProduct.imgHover.url) {
      imgHover = `${API_URL}${rawProduct.imgHover.url}`;
    }
  }
  
  // Process colors based on the new structure
  let processedColors = [];
  if (Array.isArray(rawProduct.colors)) {
    // Check if colors is an array of objects with name and imgSrc
    if (rawProduct.colors.length > 0 && typeof rawProduct.colors[0] === 'object' && rawProduct.colors[0].name) {
      processedColors = rawProduct.colors.map(color => ({
        name: color.name,
        bgColor: `bg-${color.name.toLowerCase().replace(/\s+/g, '-')}`,
        imgSrc: color.imgSrc || imgSrc
      }));
    } 
    // Handle case where colors is an array of strings
    else if (rawProduct.colors.length > 0 && typeof rawProduct.colors[0] === 'string') {
      processedColors = rawProduct.colors.map(color => ({
        name: color,
        bgColor: `bg-${color.toLowerCase().replace(/\s+/g, '-')}`,
        imgSrc: imgSrc
      }));
    }
  }
  
  // Extract gallery images if available, prefer medium > small > original
  const gallery = Array.isArray(rawProduct.gallery) 
    ? rawProduct.gallery.map(img => {
        if (!img) return { id: 0, url: '/vercel.svg' };
        let imageUrl = '/vercel.svg';
        if (img.formats && img.formats.medium) {
          imageUrl = `${API_URL}${img.formats.medium.url}`;
        } else if (img.formats && img.formats.small) {
          imageUrl = `${API_URL}${img.formats.small.url}`;
        } else if (img.url && img.url.startsWith('http')) {
          imageUrl = img.url;
        } else if (img.url) {
          imageUrl = `${API_URL}${img.url}`;
        }
        return { id: img.id || img.documentId || 0, url: imageUrl };
      }) 
    : [];
  
  // Handle sizes
  const sizes = Array.isArray(rawProduct.sizes) 
    ? rawProduct.sizes 
    : (rawProduct.filterSizes || []);
  
  return {
    ...rawProduct,
    id: rawProduct.documentId, // Use documentId as the id for consistent reference
    imgSrc, // Now the full object, not a string
    imgHover,
    gallery,
    colors: processedColors,
    sizes,
    title: rawProduct.title || "Untitled Product",
    price: rawProduct.price || 0,
    oldPrice: rawProduct.oldPrice || null,
    isOnSale: !!rawProduct.oldPrice,
    salePercentage: rawProduct.salePercentage || "25%"
  };
}
