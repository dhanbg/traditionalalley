"use client";
import ProductCard1 from "@/components/productCards/ProductCard1";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchDataFromApi } from "@/utils/api";
import { PRODUCTS_API } from "@/utils/urls";
import { getBestImageUrl } from "@/utils/imageUtils";

const tabItems = ["Formal Wear", "Casual Wear", "Accessories", "Activewear", "Footwear"];
const DEFAULT_IMAGE = '/images/placeholder.jpg';

export default function ProductsMen({ parentClass = "flat-spacing-3 pt-0" }) {
  const [activeItem, setActiveItem] = useState(tabItems[0]); // Default the first item as active
  const [selectedItems, setSelectedItems] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from the backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Add a random parameter to prevent caching
        const timestamp = new Date().getTime();
        // Filter to get only men's products
        const response = await fetchDataFromApi(`${PRODUCTS_API}&filters[collection][category][title][$eq]=Men&timestamp=${timestamp}`);
        
        if (response && response.data && response.data.length > 0) {
          // Transform the products to the format expected by ProductCard1
          const transformedProducts = response.data.map(product => {
            // Skip processing if product is undefined or null
            if (!product) return null;
            
            // Get main image URL with fallback
            const imgSrc = getBestImageUrl(product.imgSrc, 'medium') || DEFAULT_IMAGE;
            
            // Get hover image URL with fallback to main image
            const imgHover = getBestImageUrl(product.imgHover, 'medium') || imgSrc;
            
            // Process gallery images if available
            const gallery = Array.isArray(product.gallery) 
              ? product.gallery
                  .filter(img => img != null) // Filter out null/undefined
                  .map(img => ({
                    id: img.id || 0,
                    url: getBestImageUrl(img, 'medium') || DEFAULT_IMAGE
                  }))
              : [];
            
            // Process colors to ensure they're in the correct format
            let processedColors = null;
            
            if (Array.isArray(product.colors)) {
              processedColors = product.colors;
            }

            // Get tabFilterOptions directly from the product
            const tabFilterOptions = product.tabFilterOptions || [];
            
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
              tabFilterOptions,
              isActive,
              isOnSale: !!product.oldPrice,
              salePercentage: product.salePercentage || "25%"
            };
          }).filter(Boolean); // Remove any null values
          
          setAllProducts(transformedProducts);
          setError(null);
        } else {
          // Set an error if no products were found
          setError("No men's products found in API response");
          setAllProducts([]);
        }
        
        setLoading(false);
      } catch (error) {
        setError(`Error fetching products: ${error.message || "Unknown error"}`);
        setAllProducts([]);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const newArrivalsElement = document.getElementById("newArrivalsMen");
    if (newArrivalsElement) {
      newArrivalsElement.classList.remove("filtered");
      
      setTimeout(() => {
        const filtered = allProducts.filter(product => 
          product.tabFilterOptions && product.tabFilterOptions.includes(activeItem) &&
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
        <div className="heading-section text-center wow fadeInUp">
          <ul className="tab-product-v2 justify-content-sm-center">
            {tabItems.map((item) => (
              <li key={item} className="nav-tab-item">
                <a
                  className={activeItem === item ? "active" : ""}
                  onClick={() => setActiveItem(item)}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="flat-animate-tab">
          <div className="tab-content">
            <div
              className="tab-pane active show tabFilter filtered"
              id="newArrivalsMen"
              role="tabpanel"
            >
              {loading ? (
                <div className="text-center py-5">Loading products...</div>
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
                    <Link href={`/men`} className="btn-line">
                      View All Products
                    </Link>
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