"use client";
import { useContextElement } from "@/context/Context";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { fetchDataFromApi, getOptimizedImageUrl } from "@/utils/api";
import { API_URL, PRODUCT_REVIEWS_API } from "@/utils/urls";
import { openCartModal } from "@/utils/openCartModal";

// Default placeholder image
const DEFAULT_IMAGE = '/images/placeholder.jpg';

export default function ProductCompare() {
  const {
    compareItem,
    setCompareItem,
    removeFromCompareItem,
    isAddedToCartProducts,
    addProductToCart,
    user
  } = useContextElement();
  const { data: session } = useSession();
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({}); // { [documentId]: averageRating }
  const [ratingCounts, setRatingCounts] = useState({}); // { [documentId]: count }

  // Helper to ensure isAddedToCartProducts is always an array
  const addedToCartArray = Array.isArray(isAddedToCartProducts) ? isAddedToCartProducts : [];

  useEffect(() => {
    const fetchCompareProducts = async () => {
      if (!compareItem || compareItem.length === 0) {
        setItems([]);
        setRatings({});
        setRatingCounts({});
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Create an array to track valid products
        const validProducts = [];
        const invalidIds = [];
        const ratingsObj = {};
        const countsObj = {};
        
        // Process each product ID individually to isolate errors
        for (const id of compareItem) {
          try {
            let response;
            
            // Check if the id is a number or string (documentId)
            if (typeof id === 'string' && id.length > 8) {
              // This is likely a documentId - use filters
              response = await fetchDataFromApi(`/api/products?filters[documentId][$eq]=${id}&populate=*`);
              
              // Check if we got results
              if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
                // We found it by documentId
              } else {
                // Try as a regular ID as fallback
                response = await fetchDataFromApi(`/api/products/${id}?populate=*`);
              }
            } else {
              // This is likely a numeric ID - use direct endpoint
              response = await fetchDataFromApi(`/api/products/${id}?populate=*`);
              
              // If not found by ID, try documentId as fallback
              if (!response?.data) {
                response = await fetchDataFromApi(`/api/products?filters[documentId][$eq]=${id}&populate=*`);
              }
            }
            
            if (!response || !response.data) {
              invalidIds.push(id);
              continue;
            }
            
            // Handle both single product and array responses
            const productData = Array.isArray(response.data) ? 
              (response.data.length > 0 ? response.data[0] : null) : 
              response.data;
            
            if (!productData) {
              invalidIds.push(id);
              continue;
            }
            
            // Extract product attributes
            const attrs = productData.attributes || productData;
            const productId = productData.id;
            const documentId = attrs.documentId || productId;
            
            // Get optimized image URL
            const imgSrc = getOptimizedImageUrl(attrs.imgSrc) || DEFAULT_IMAGE;
            
            // Check if we already have this product in the validProducts array
            const isDuplicate = validProducts.some(
              p => p.id === productId || p.documentId === attrs.documentId
            );
            
            if (!isDuplicate) {
              // First get basic product info
              const productInfo = {
                id: productId,
                documentId: documentId,
                originalId: id, // Store the original ID used to fetch the product
                title: attrs.title || "Product",
                price: attrs.price || 0,
                oldPrice: attrs.oldPrice,
                imgSrc: imgSrc,
                collection: attrs.collection?.name || "Collection",
                category: attrs.collection?.category?.title || "Category",
                sizes: attrs.sizes || ["S", "M", "L"],
                colors: attrs.colors || [],
                material: attrs.material || "Cotton",
                brand: attrs.brand || "Brand",
              };
              
              // If we have a collection reference but not the full collection data
              if (attrs.collection && typeof attrs.collection === 'object' && !attrs.collection.category) {
                try {
                  // Fetch the collection details to get category info
                  const collectionId = attrs.collection.id;
                  const collectionResponse = await fetchDataFromApi(`/api/collections?populate=*&filters[id][$eq]=${collectionId}`);
                  
                  if (collectionResponse?.data && Array.isArray(collectionResponse.data) && collectionResponse.data.length > 0) {
                    const collectionData = collectionResponse.data[0];
                    // Update product info with collection and category data
                    productInfo.collection = collectionData.name || collectionData.attributes?.name || "Collection";
                    productInfo.category = collectionData.category?.title || collectionData.attributes?.category?.title || "Category";
                  }
                } catch (error) {
                }
              }
              
              validProducts.push(productInfo);
              // Fetch average rating for this product
              try {
                const reviewsRes = await fetchDataFromApi(PRODUCT_REVIEWS_API(documentId));
                if (reviewsRes && reviewsRes.data && reviewsRes.data.length > 0) {
                  let total = 0;
                  reviewsRes.data.forEach(r => {
                    if (r.rating) total += parseInt(r.rating);
                  });
                  ratingsObj[documentId] = (total / reviewsRes.data.length).toFixed(1);
                  countsObj[documentId] = reviewsRes.data.length;
                } else {
                  ratingsObj[documentId] = null;
                  countsObj[documentId] = 0;
                }
              } catch (e) {
                ratingsObj[documentId] = null;
                countsObj[documentId] = 0;
              }
            }
          } catch (error) {
            invalidIds.push(id);
          }
        }
        
        // If we found invalid IDs, remove them from compare items
        if (invalidIds.length > 0) {
          const updatedCompareItems = compareItem.filter(id => !invalidIds.includes(id));
          setCompareItem(updatedCompareItems);
        }
        
        setItems(validProducts);
        setRatings(ratingsObj);
        setRatingCounts(countsObj);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    
    fetchCompareProducts();
  }, [compareItem, setCompareItem]);

  const handleAddToCart = (id) => {
    if (!user) {
      signIn();
    } else {
      addProductToCart(id);
    }
  };

  const removeItem = (product) => {
    // Use the original ID that was used to fetch the product
    // This ensures we're removing the correct item from the compareItem array
    const idToRemove = product.originalId || product.documentId || product.id;
    removeFromCompareItem(idToRemove);
  };

  return (
    <section className="flat-spacing-2 pt_0">
      <div className="container">
        <div className="tf-page-title">
          <div className="container-full">
            <div className="heading text-center">Compare Products</div>
          </div>
        </div>
        <div className="tf-compare-list">
          <div className="tf-compare-head">
            <div className="tf-compare-col-1">
              <div className="tf-compare-area">
                <div className="position-relative">
                  <h6>Compare Products</h6>
                  <p>
                    Discover the ideal product by using our comparison tool to
                    evaluate features, prices, and reviews side by side.
                  </p>
                </div>
              </div>
            </div>
            {compareItem.map((elm, i) => (
              <div key={i} className="tf-compare-col">
                <div className="tf-compare-area">
                  <div className="position-relative">
                    <div className="tf-compare-image">
                      <Link href={`/product-detail/${elm.id}`}>
                        <Image
                          alt="img-compare"
                          src={elm.imgSrc}
                          width={360}
                          height={384}
                        />
                      </Link>
                    </div>
                    <div className="tf-compare-remove">
                      <div
                        className="tf-btn-remove"
                        onClick={() => removeItem(elm)}
                      >
                        <i className="icon-close" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="tf-compare-content">
            <div className="tf-compare-row">
              <div className="tf-compare-col-1">
                <div className="tf-compare-area">
                  <h6>Product</h6>
                </div>
              </div>
              {compareItem.map((elm, i) => (
                <div key={i} className="tf-compare-col">
                  <div className="tf-compare-area">
                    <div className="tf-compare-meta-variant">
                      <div className="tf-compare-list-title">
                        <h6>
                          <Link
                            href={`/product-detail/${elm.id}`}
                            className="link"
                          >
                            {elm.title}
                          </Link>
                        </h6>
                      </div>
                      <div className="tf-compare-variant">
                        <span>Color: {elm.color}</span>
                      </div>
                      <div className="tf-compare-list-price">
                        <div className="price">${elm.price}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="tf-compare-row">
              <div className="tf-compare-col-1">
                <div className="tf-compare-area">
                  <h6>Description</h6>
                </div>
              </div>
              {compareItem.map((elm, i) => (
                <div key={i} className="tf-compare-col">
                  <div className="tf-compare-area">
                    <div className="tf-compare-desc">
                      <p>{elm.description || "No description available"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="tf-compare-row">
              <div className="tf-compare-col-1">
                <div className="tf-compare-area">
                  <h6>Availability</h6>
                </div>
              </div>
              {compareItem.map((elm, i) => (
                <div key={i} className="tf-compare-col">
                  <div className="tf-compare-area">
                    <div className="tf-compare-stock">
                      <div className="icon">
                        <i className="icon-check" />
                      </div>
                      <p>In Stock</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="tf-compare-row">
              <div className="tf-compare-col-1">
                <div className="tf-compare-area">
                  <h6>Add to cart</h6>
                </div>
              </div>
              {compareItem.map((elm, i) => (
                <div key={i} className="tf-compare-col">
                  <div className="tf-compare-area">
                    <div className="tf-compare-btn">
                      <button
                        onClick={() => handleAddToCart(elm.id)}
                        className="tf-btn btn-fill animate-hover-btn radius-3 justify-content-center fw-6"
                      >
                        <span>
                          {isAddedToCartProducts(elm.id)
                            ? "Added to cart"
                            : "Add to cart"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}