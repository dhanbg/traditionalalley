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
  
  // Fetch product by documentId with variants
  const response = await fetchDataFromApi(`/api/products?filters[documentId][$eq]=${id}&populate=*`);
  let product = null;
  let variants = [];
  
  if (response.data && response.data.length > 0) {
    const rawProduct = response.data[0];
    
    // Transform API response to match the expected format
    product = transformProduct(rawProduct);
    
    // Fetch variants for this product
    try {
      const variantsResponse = await fetchDataFromApi(`/api/product-variants?filters[product][documentId][$eq]=${id}&populate=*`);
      if (variantsResponse.data && variantsResponse.data.length > 0) {
        variants = variantsResponse.data.map(transformVariant);
      }
      
      // Always add the current product as the first variant (main color)
      const currentProductVariant = {
        id: `current-${id}`,
        title: product.title, // Add title directly to the variant for easy access
        color: product.color, // Use the main product's color field
        imgSrc: product.imgSrc,
        imgHover: product.imgHover,
        gallery: product.gallery,
        isDefault: true,
        inStock: product.inStock,
        quantity: product.quantity,
        size_stocks: product.size_stocks, // Include size_stocks from main product
        isCurrentProduct: true,
        product: {
          documentId: id,
          title: product.title,
          price: product.price
        }
      };
      
      // Add current product variant at the beginning
      variants.unshift(currentProductVariant);
      
    } catch (error) {
      console.error('Error fetching variants:', error);
    }
    
    // Also check for products with the same productGroup (for existing setup)
    if (!variants.length && product.productGroup) {
      try {
        const groupResponse = await fetchDataFromApi(`/api/products?filters[productGroup][$eq]=${product.productGroup}&populate=*`);
        if (groupResponse.data && groupResponse.data.length > 1) {
          variants = groupResponse.data.map(p => transformProductAsVariant(p));
        }
      } catch (error) {
        console.error('Error fetching product group:', error);
      }
    }
    
    // If we have variants, find and mark the current product as active
    if (variants.length > 0) {
      const currentVariantIndex = variants.findIndex(v => v.product?.documentId === id);
      if (currentVariantIndex !== -1) {
        variants[currentVariantIndex].isCurrentProduct = true;
      }
    }
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
      {product && <Details1 product={product} variants={variants} />}
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
  
  // Handle hover image: prefer original, then medium, then small
  let imgHover = imgSrc; // Default to main image
  if (rawProduct.imgHover) {
    if (rawProduct.imgHover.url && rawProduct.imgHover.url.startsWith('http')) {
      imgHover = rawProduct.imgHover.url;
    } else if (rawProduct.imgHover.url) {
      imgHover = `${API_URL}${rawProduct.imgHover.url}`;
    } else if (rawProduct.imgHover.formats && rawProduct.imgHover.formats.medium) {
      imgHover = `${API_URL}${rawProduct.imgHover.formats.medium.url}`;
    } else if (rawProduct.imgHover.formats && rawProduct.imgHover.formats.small) {
      imgHover = `${API_URL}${rawProduct.imgHover.formats.small.url}`;
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
  
  // Extract gallery images if available, prefer original > medium > small
  const gallery = Array.isArray(rawProduct.gallery) 
    ? rawProduct.gallery.map(img => {
        if (!img) return { id: 0, url: '/vercel.svg' };
        let imageUrl = '/vercel.svg';
        if (img.url && img.url.startsWith('http')) {
          imageUrl = img.url;
        } else if (img.url) {
          imageUrl = `${API_URL}${img.url}`;
        } else if (img.formats && img.formats.medium) {
          imageUrl = `${API_URL}${img.formats.medium.url}`;
        } else if (img.formats && img.formats.small) {
          imageUrl = `${API_URL}${img.formats.small.url}`;
        }
        return { id: img.id || img.documentId || 0, url: imageUrl };
      }) 
    : [];
  
  // Handle the main product's color field
  let productColor = null;
  if (rawProduct.color) {
    productColor = {
      ...rawProduct.color,
      url: rawProduct.color.url && rawProduct.color.url.startsWith('http') 
        ? rawProduct.color.url 
        : `${API_URL}${rawProduct.color.url}`
    };
  }
  
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
    color: productColor, // Add the main product's color
    colors: processedColors,
    sizes,
    size_stocks: rawProduct.size_stocks, // Include size_stocks data
    title: rawProduct.title || "Untitled Product",
    price: rawProduct.price || 0,
    oldPrice: rawProduct.oldPrice || null,
    isOnSale: !!rawProduct.oldPrice,
    salePercentage: rawProduct.salePercentage || "25%",
    weight: rawProduct.weight || null
  };
}

// Helper function to transform API variant to the expected format
function transformVariant(rawVariant) {
  if (!rawVariant) return null;
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
  
  // Handle variant images
  let imgSrc = '/images/placeholder.jpg';
  if (rawVariant.imgSrc) {
    if (rawVariant.imgSrc.url && rawVariant.imgSrc.url.startsWith('http')) {
      imgSrc = rawVariant.imgSrc.url;
    } else if (rawVariant.imgSrc.url) {
      imgSrc = `${API_URL}${rawVariant.imgSrc.url}`;
    }
  }
  
  let imgHover = imgSrc;
  if (rawVariant.imgHover) {
    if (rawVariant.imgHover.url && rawVariant.imgHover.url.startsWith('http')) {
      imgHover = rawVariant.imgHover.url;
    } else if (rawVariant.imgHover.url) {
      imgHover = `${API_URL}${rawVariant.imgHover.url}`;
    }
  }
  
  // Handle color image
  let color = null;
  if (rawVariant.color) {
    color = {
      ...rawVariant.color,
      url: rawVariant.color.url && rawVariant.color.url.startsWith('http') 
        ? rawVariant.color.url 
        : `${API_URL}${rawVariant.color.url}`
    };
  }
  
  const gallery = Array.isArray(rawVariant.gallery) 
    ? rawVariant.gallery.map(img => {
        if (!img) return { id: 0, url: '/images/placeholder.jpg' };
        let imageUrl = '/images/placeholder.jpg';
        if (img.url && img.url.startsWith('http')) {
          imageUrl = img.url;
        } else if (img.url) {
          imageUrl = `${API_URL}${img.url}`;
        }
        return { id: img.id || img.documentId || 0, url: imageUrl };
      }) 
    : [];
  
  return {
    id: rawVariant.id || rawVariant.documentId,
    design: rawVariant.design || null, // Include the design field
    color, // New color image field
    imgSrc,
    imgHover,
    gallery,
    isDefault: rawVariant.isDefault || false,
    inStock: rawVariant.inStock !== false,
    quantity: rawVariant.quantity || 0,
    size_stocks: rawVariant.size_stocks, // Include size_stocks data from variant
    product: rawVariant.product
  };
}

// Helper function to transform existing products as variants (for backward compatibility)
function transformProductAsVariant(rawProduct) {
  if (!rawProduct) return null;
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
  
  // Extract color from title or use a default
  const colorName = extractColorFromTitle(rawProduct.title) || 'Default';
  
  let imgSrc = '/images/placeholder.jpg';
  if (rawProduct.imgSrc) {
    if (rawProduct.imgSrc.url && rawProduct.imgSrc.url.startsWith('http')) {
      imgSrc = rawProduct.imgSrc.url;
    } else if (rawProduct.imgSrc.url) {
      imgSrc = `${API_URL}${rawProduct.imgSrc.url}`;
    }
  }
  
  return {
    id: rawProduct.documentId,
    colorName,
    colorCode: null,
    imgSrc,
    imgHover: imgSrc,
    gallery: [],
    isDefault: false,
    inStock: rawProduct.inStock !== false,
    quantity: rawProduct.quantity || 0,
    product: {
      documentId: rawProduct.documentId,
      title: rawProduct.title,
      price: rawProduct.price
    }
  };
}

// Helper function to extract color from product title
function extractColorFromTitle(title) {
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'white', 'gray', 'grey', 'beige', 'navy', 'maroon'];
  const lowerTitle = title.toLowerCase();
  
  for (const color of colors) {
    if (lowerTitle.includes(color)) {
      return color.charAt(0).toUpperCase() + color.slice(1);
    }
  }
  
  return null;
}
