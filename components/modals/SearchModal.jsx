"use client";
import React, { useState, useEffect } from "react";
import ProductCard1 from "../productCards/ProductCard1";
import { fetchDataFromApi } from "@/utils/api";
import { SEARCH_PRODUCTS_API, API_URL } from "@/utils/urls";
import { useRouter } from "nextjs-toploader/app";
import Link from "next/link";
import { searchProductsWithVariants, fetchSingleProductWithVariants } from "@/utils/productVariantUtils";


// Helper function to transform product data (copied from RelatedProducts.jsx)
const DEFAULT_IMAGE = '/logo.png';
const transformProduct = (rawProduct) => {
  if (!rawProduct) return null;
  // Do NOT convert imgSrc/imgHover to string URL here; pass the object
  const id = rawProduct.documentId || rawProduct.id || rawProduct.attributes?.id || 0;
  const productObj = {
    ...rawProduct,
    id,
    documentId: id,
    imgSrc: rawProduct.imgSrc,
    imgHover: rawProduct.imgHover,
    title: rawProduct.title || rawProduct.attributes?.title || "Untitled Product",
    price: rawProduct.price || rawProduct.attributes?.price || 0,
    oldPrice: rawProduct.oldPrice || rawProduct.attributes?.oldPrice || null,
    isOnSale: !!rawProduct.oldPrice || !!rawProduct.attributes?.oldPrice,
    salePercentage: rawProduct.salePercentage || rawProduct.attributes?.salePercentage || "25%",
    size_stocks: rawProduct.size_stocks || rawProduct.attributes?.size_stocks
  };
  // Use isActive from the API - treat null or undefined as inactive
  productObj.isActive = rawProduct.isActive === true;
  return productObj;
};

export default function SearchModal() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Fetch recently viewed products from localStorage (IDs) and then fetch product data
  useEffect(() => {
    async function fetchRecentlyViewedProducts() {
      const ids = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
      if (!ids.length) {
        setRecentlyViewed([]);
        return;
      }
      try {
        // Fetch product data with variants for each ID
        const productPromises = ids.slice(0, 8).map(id => fetchSingleProductWithVariants(id));
        const responses = await Promise.all(productPromises);
        
        // Flatten the results and filter out inactive items
        const products = responses
          .flat()
          .filter(Boolean)
          .filter(product => product.isActive !== false);
          
        setRecentlyViewed(products);
      } catch (error) {
        console.error('Error fetching recently viewed products:', error);
        setRecentlyViewed([]);
      }
    }
    if (typeof window !== 'undefined') {
      fetchRecentlyViewedProducts();
    }
  }, []);

  // Handle search submission
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setLoading(true);
    
    try {
      // Use the new search utility that includes both products and variants
      const searchResults = await searchProductsWithVariants(searchQuery);
      setSearchResults(searchResults);
    } catch (error) {
      console.error("Error searching products with variants:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim() === "") {
      setSearching(false);
      setSearchResults([]);
    }
  };

  // Navigate to product detail
  const navigateToProduct = (product) => {
    // Add to recently viewed (store only IDs)
    let viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
    // Remove if already exists
    const existingIndex = viewed.findIndex(id => id === product.documentId || id === product.id);
    if (existingIndex !== -1) {
      viewed.splice(existingIndex, 1);
    }
    // Add to beginning
    viewed.unshift(product.documentId || product.id);
    // Limit to 8
    viewed = viewed.slice(0, 8);
    localStorage.setItem("recentlyViewed", JSON.stringify(viewed));
    // Navigate to product
    router.push(`/product-detail/${product.documentId}`);
    // Close the modal
    const modal = document.getElementById('search');
    if (modal) {
      const bootstrapModal = window.bootstrap && window.bootstrap.Modal.getInstance(modal);
      if (bootstrapModal) {
        bootstrapModal.hide();
      }
    }
  };

  // Load more results
  const handleLoadMore = async () => {
    setLoading(true);
    try {
      const currentCount = searchResults.length;
      const res = await fetchDataFromApi(`${SEARCH_PRODUCTS_API(searchQuery)}&pagination[start]=${currentCount}&pagination[limit]=8`);
      // Filter out products that are inactive
      const filteredResults = (res.data || [])
        .map(product => transformProduct(product))
        .filter(product => product && product.isActive === true);
      setSearchResults(prev => [...prev, ...filteredResults]);
    } catch (error) {
      console.error("Error loading more products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade modal-search" id="search">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="d-flex justify-content-between align-items-center">
            <h5>Search</h5>
            <span
              className="icon-close icon-close-popup"
              data-bs-dismiss="modal"
            />
          </div>

          <form className="form-search" onSubmit={handleSearch}>
            <fieldset className="text">
              <input
                type="text"
                placeholder="What are you looking for?"
                className=""
                name="text"
                tabIndex={0}
                value={searchQuery}
                onChange={handleInputChange}
                aria-required="true"
                required
              />
            </fieldset>
            <button className="" type="submit" disabled={loading}>
              <svg
                className="icon"
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
                  stroke="#181818"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21.35 21.0004L17 16.6504"
                  stroke="#181818"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>

          {loading && (
            <div className="text-center my-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {searching && !loading && searchResults.length === 0 && (
            <div className="text-center my-4">
              <p>No products found matching "{searchQuery}"</p>
            </div>
          )}

          {searching && searchResults.length > 0 && (
            <div className="mt-4">
              <h6 className="mb_16">Search Results</h6>
              <div className="tf-grid-layout tf-col-2 lg-col-3 xl-col-4">
                {searchResults.map((product, i) => (
                  <div key={i} onClick={() => navigateToProduct(product)} style={{cursor: 'pointer'}}>
                    <ProductCard1 product={product} />
                  </div>
                ))}
              </div>
              
              {searchResults.length % 8 === 0 && searchResults.length > 0 && (
                <div
                  className="wd-load view-more-button text-center"
                  onClick={handleLoadMore}
                >
                  <button
                    className={`tf-loading btn-loadmore tf-btn btn-reset ${
                      loading ? "loading" : ""
                    }`}
                    disabled={loading}
                  >
                    <span className="text text-btn text-btn-uppercase">
                      Load more
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

          {!searching && recentlyViewed.length > 0 && (
            <div className="mt-4">
              <h6 className="mb_16">Recently viewed products</h6>
              <div className="tf-grid-layout tf-col-2 lg-col-3 xl-col-4">
                {recentlyViewed.slice(0, 8).map((product, i) => (
                  <div key={i} onClick={() => navigateToProduct(product)} style={{cursor: 'pointer'}}>
                    <ProductCard1 product={product} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
