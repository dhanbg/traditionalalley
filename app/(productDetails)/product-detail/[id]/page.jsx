import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import Breadcumb from "@/components/productDetails/Breadcumb";
import Descriptions1 from "@/components/productDetails/descriptions/Descriptions1";

import Details1 from "@/components/productDetails/details/Details1";
import RelatedProducts from "@/components/productDetails/RelatedProducts";
import { fetchDataFromApi } from "@/utils/api";
import { API_URL } from "@/utils/urls";
import { calculateInStock } from "@/utils/stockUtils";
import React from "react";
import Link from "next/link";

export async function generateMetadata({ params }) {
  const { id } = await params;
  
  try {
    // Fetch product data for metadata
    const timestamp = Date.now();
    const response = await fetchDataFromApi(`/api/products?filters[documentId][$eq]=${id}&populate=*&timestamp=${timestamp}`);
    
    if (response.data && response.data.length > 0) {
      const rawProduct = response.data[0];
      const product = transformProduct(rawProduct);
      
      if (product && product.isActive !== false) {
        const title = `${product.title} | Traditional Alley`;
        const description = product.description 
          ? `${product.description.substring(0, 155)}...` 
          : `Shop ${product.title} at Traditional Alley. Premium quality traditional and modern fashion.`;
        
        return {
          title,
          description,
          openGraph: {
            title,
            description,
            images: product.imgSrc?.url ? [{
              url: product.imgSrc.url.startsWith('http') ? product.imgSrc.url : `${API_URL}${product.imgSrc.url}`,
              width: 800,
              height: 600,
              alt: product.title
            }] : []
          }
        };
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }
  
  // Fallback metadata
  return {
    title: "Product Detail | Traditional Alley",
    description: "Traditional Alley - Premium quality traditional and modern fashion.",
  };
}

export default async function page({ params, searchParams }) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const preferredVariantId = resolvedSearchParams?.variant || null;
  
  // Fetch product by documentId with variants
  const timestamp = Date.now();
  const response = await fetchDataFromApi(`/api/products?filters[documentId][$eq]=${id}&populate=*&timestamp=${timestamp}`);
  let product = null;
  let variants = [];
  
  if (response.data && response.data.length > 0) {
    const rawProduct = response.data[0];
    
    // Transform API response to match the expected format
    product = transformProduct(rawProduct);
    
    // Check product availability
    
    // Block access to inactive products (isActive: false)
    if (product.isActive === false) {
      return (
        <>
          <Header1 />
          <div className="tf-page-title">
            <div className="container-full">
              <div className="heading text-center">Product Unavailable</div>
            </div>
          </div>
          <section className="flat-spacing-2">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-xl-4 col-lg-6 col-md-8">
                  <div className="tf-page-not-found text-center">
                    <div className="tf-page-not-found-content">
                      <h5 className="fw-5 text-1">Product Currently Unavailable</h5>
                      <p className="text_black-2">This product is currently not available for viewing or purchase.</p>
                      <Link href="/" className="tf-btn btn-fill animate-hover-btn radius-3">
                        <span>Browse Products</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <Footer1 />
        </>
      );
    }
    
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
        isActive: product.isActive,
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
      // Silently handle variants not found - this is expected for products without variants
    }
    
    // Also check for products with the same productGroup (for existing setup)
    if (!variants.length && product.productGroup) {
      try {
        const groupResponse = await fetchDataFromApi(`/api/products?filters[productGroup][$eq]=${product.productGroup}&populate=*`);
        if (groupResponse.data && groupResponse.data.length > 1) {
          variants = groupResponse.data.map(p => transformProductAsVariant(p));
        }
      } catch (error) {
        // Silently handle product group not found
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
      {product && <Details1 product={product} variants={variants} preferredVariantId={preferredVariantId} />}
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
  const imgSrc = rawProduct.imgSrc || null;
  
  // Handle hover image: prefer original, then medium, then small
  let imgHover = imgSrc; // Default to main image
  if (rawProduct.imgHover) {
    if (rawProduct.imgHover.url && rawProduct.imgHover.url.startsWith('http')) {
      imgHover = rawProduct.imgHover.url;
    } else if (rawProduct.imgHover.url) {
      imgHover = rawProduct.imgHover.url.startsWith('http') ? rawProduct.imgHover.url : `${API_URL}${rawProduct.imgHover.url}`;
    } else if (rawProduct.imgHover.formats && rawProduct.imgHover.formats.medium) {
      const mediumUrl = rawProduct.imgHover.formats.medium.url;
      imgHover = mediumUrl.startsWith('http') ? mediumUrl : `${API_URL}${mediumUrl}`;
    } else if (rawProduct.imgHover.formats && rawProduct.imgHover.formats.small) {
      const smallUrl = rawProduct.imgHover.formats.small.url;
      imgHover = smallUrl.startsWith('http') ? smallUrl : `${API_URL}${smallUrl}`;
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
        if (!img) return { id: 0, url: null };
        let imageUrl = null;
        if (img.url && img.url.startsWith('http')) {
          imageUrl = img.url;
        } else if (img.url) {
          imageUrl = img.url.startsWith('http') ? img.url : `${API_URL}${img.url}`;
        } else if (img.formats && img.formats.medium) {
          const mediumUrl = img.formats.medium.url;
          imageUrl = mediumUrl.startsWith('http') ? mediumUrl : `${API_URL}${mediumUrl}`;
        } else if (img.formats && img.formats.small) {
          const smallUrl = img.formats.small.url;
          imageUrl = smallUrl.startsWith('http') ? smallUrl : `${API_URL}${smallUrl}`;
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
  
  const transformedProduct = {
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
  
  // Use isActive from the API - treat null or undefined as inactive
  transformedProduct.isActive = rawProduct.isActive === true;
  
  return transformedProduct;
}

// Helper function to transform API variant to the expected format
function transformVariant(rawVariant) {
  if (!rawVariant) return null;
  

  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
  
  // Handle variant images
  let imgSrc = '/logo.png';
  if (rawVariant.imgSrc) {
    if (rawVariant.imgSrc.url && rawVariant.imgSrc.url.startsWith('http')) {
      imgSrc = rawVariant.imgSrc.url;
    } else if (rawVariant.imgSrc.url) {
      imgSrc = rawVariant.imgSrc.url.startsWith('http') ? rawVariant.imgSrc.url : `${API_URL}${rawVariant.imgSrc.url}`;
    }
  }
  
  let imgHover = imgSrc;
  if (rawVariant.imgHover) {
    if (rawVariant.imgHover.url && rawVariant.imgHover.url.startsWith('http')) {
      imgHover = rawVariant.imgHover.url;
    } else if (rawVariant.imgHover.url) {
      imgHover = rawVariant.imgHover.url.startsWith('http') ? rawVariant.imgHover.url : `${API_URL}${rawVariant.imgHover.url}`;
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
        if (!img) return { id: 0, url: '/logo.png' };
        let imageUrl = '/logo.png';
        if (img.url && img.url.startsWith('http')) {
          imageUrl = img.url;
        } else if (img.url) {
          imageUrl = `${API_URL}${img.url}`;
        }
        return { id: img.id || img.documentId || 0, url: imageUrl };
      }) 
    : [];
  
  // Use variant title if available, otherwise fall back to main product title
  const variantTitle = rawVariant.title && rawVariant.title.trim() !== '' 
    ? rawVariant.title
    : (rawVariant.product?.title || "Untitled Product");

  return {
    id: rawVariant.id || rawVariant.documentId,
    documentId: rawVariant.documentId, // Preserve documentId for stock operations
    title: variantTitle, // Add title field
    design: rawVariant.design || null, // Include the design field
    color, // New color image field
    imgSrc,
    imgHover,
    gallery,
    isDefault: rawVariant.isDefault || false,
    isActive: rawVariant.isActive !== false,
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
  
  let imgSrc = '/logo.png';
  if (rawProduct.imgSrc) {
    if (rawProduct.imgSrc.url && rawProduct.imgSrc.url.startsWith('http')) {
      imgSrc = rawProduct.imgSrc.url;
    } else if (rawProduct.imgSrc.url) {
      imgSrc = rawProduct.imgSrc.url.startsWith('http') ? rawProduct.imgSrc.url : `${API_URL}${rawProduct.imgSrc.url}`;
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
    isActive: rawProduct.isActive !== false,
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
