"use client";
import ProductCard1 from "@/components/productCards/ProductCard1";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchDataFromApi } from "@/utils/api";
import { PRODUCTS_API, API_URL } from "@/utils/urls";
import { debugApiCall, debugApiResponse, debugComponentMount } from "@/utils/debug";

const tabItems = ["New Arrivals", "Best Seller", "On Sale"];
const DEFAULT_IMAGE = '/images/placeholder.jpg';

export default function Products3({ parentClass = "flat-spacing-3" }) {
  const [activeItem, setActiveItem] = useState(tabItems[0]); // Default the first item as active
  const [selectedItems, setSelectedItems] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from the backend
  useEffect(() => {
    debugComponentMount('Products3');
    
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Fetch all products with tabFilterOptions2 specified
        // Add a random parameter to prevent caching
        const timestamp = new Date().getTime();
        const endpoint = `${PRODUCTS_API}&timestamp=${timestamp}`;
        
        // Debug API call
        debugApiCall(endpoint, 'GET');
        console.log('🛍️ Products3 - Fetching products:', {
          endpoint,
          PRODUCTS_API,
          API_URL,
          NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
          timestamp: new Date().toISOString()
        });
        
        // Explicitly request only products that have tabFilterOptions2
        const response = await fetchDataFromApi(endpoint);
        
        // Debug API response
        debugApiResponse(endpoint, { ok: !!response }, response);
        console.log('📦 Products3 - API Response:', {
          success: !!response,
          dataCount: response?.data?.length || 0,
          hasData: !!(response?.data && response.data.length > 0),
          timestamp: new Date().toISOString()
        });
        
        if (response && response.data && response.data.length > 0) {
          // Transform the products to the format expected by ProductCard1
          const transformedProducts = response.data.map(product => {
            if (!product) return null;
            // Pass the image object directly for ProductCard1 to handle small format
            let imgSrc = product.imgSrc || null;
            let imgHover = product.imgHover || null;
            // Process gallery images if available
            const gallery = Array.isArray(product.gallery) 
              ? product.gallery.map(img => img || null) 
              : [];
            let processedColors = null;
            if (Array.isArray(product.colors)) {
              processedColors = product.colors;
            }
            const tabFilterOptions2 = product.tabFilterOptions2 || [];
            // Use isActive from the API - treat null or undefined as inactive
            const isActive = product.isActive === true;
            
            return {
              id: product.id,
              documentId: product.documentId,
              title: product.title || "Untitled Product",
              price: product.price || 0,
              oldPrice: product.oldPrice || null,
              imgSrc,
              imgHover,
              gallery,
              colors: processedColors,
              sizes: product.sizes || [],
              tabFilterOptions2,
              isActive,
              isOnSale: !!product.oldPrice,
              salePercentage: product.salePercentage || "25%"
            };
          }).filter(Boolean);
          
          setAllProducts(transformedProducts);
          setError(null);
        } else {
          // Set an error if no products were found
          setError("No products found in API response");
          setAllProducts([]);
        }
        
        setLoading(false);
      } catch (error) {
        debugApiResponse(PRODUCTS_API, null, null, error);
        console.error('❌ Products3 - Error fetching products:', {
          error: error.message,
          PRODUCTS_API,
          API_URL,
          NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
          timestamp: new Date().toISOString()
        });
        
        setError(`Error fetching products: ${error.message || "Unknown error"}`);
        setAllProducts([]);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on active tab
  useEffect(() => {
    const newArrivalsElement = document.getElementById("newArrivals");
    if (newArrivalsElement) {
      newArrivalsElement.classList.remove("filtered");
      
      setTimeout(() => {
        const filtered = allProducts.filter(product => 
          product.tabFilterOptions2 && product.tabFilterOptions2.includes(activeItem) &&
          product.isActive === true // Hide products that are inactive
        );
        setSelectedItems(filtered);
        newArrivalsElement.classList.add("filtered");
      }, 300);
    }
  }, [activeItem, allProducts]);

  return (
    <section className={parentClass}>
      <div className="container">
        <div className="flat-animate-tab">
          <ul className="tab-product justify-content-sm-center" role="tablist">
            {tabItems.map((item) => (
              <li key={item} className="nav-tab-item">
                <a
                  href={`#`} // Generate href dynamically
                  className={activeItem === item ? "active" : ""}
                  onClick={(e) => {
                    e.preventDefault(); // Prevent default anchor behavior
                    setActiveItem(item);
                  }}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
          <div className="tab-content">
            <div
              className="tab-pane active show tabFilter filtered"
              id="newArrivals"
              role="tabpanel"
            >
              {loading ? (
                <div className="text-center py-5">
                  <span className="products3-spinner" />
                  <style jsx>{`
                    .products3-spinner {
                      display: inline-block;
                      width: 60px;
                      height: 60px;
                      border: 6px solid #f3f3f3;
                      border-top: 6px solid #e43131;
                      border-radius: 50%;
                      animation: products3-spin 1s linear infinite;
                    }
                    @keyframes products3-spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
              ) : error ? (
                <div className="text-center py-5 text-danger">
                  {error}
                </div>
              ) : (
                <>
                  <div className="tf-grid-layout tf-col-2 lg-col-3 xl-col-4">
                    {selectedItems.length > 0 ? (
                      selectedItems.map((product, i) => (
                        <ProductCard1 key={i} product={product} />
                      ))
                    ) : (
                      <div className="col-12 text-center py-5">No products found for {activeItem}</div>
                    )}
                  </div>
                  <div className="sec-btn text-center">
                    {/* <Link href={`/shop-default-grid-women`} className="btn-line">
                      View All Products
                    </Link> */}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
