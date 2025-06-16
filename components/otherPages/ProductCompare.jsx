"use client";
import { useContextElement } from "@/context/Context";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useClerk } from "@clerk/nextjs";
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
  const { openSignIn } = useClerk();
  
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
      openSignIn();
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
    <section className="flat-spacing">
      <div className="container">
        {loading ? (
          <div className="text-center py-4">
            <span className="compare-spinner" />
          </div>
        ) : !items.length ? (
          <div className="text-center py-4">
            <p className="mb-4">No items to compare yet. Add products to your comparison list and decide smarter!</p>
            <Link className="btn-line" href="/shop-default-grid">
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="tf-compare-table">
            {/* Product Images and Info Row */}
            <div className="tf-compare-row tf-compare-grid">
              {/* Empty cell for alignment with labels */}
              <div className="tf-compare-col tf-compare-field d-md-block d-none" style={{ 
                borderTopLeftRadius: 0, 
                display: 'flex', 
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <h6>Product</h6>
              </div>
              {/* Product cells */}
              {items.map((product, i) => (
                <div key={i} className="tf-compare-col" style={{ borderTopLeftRadius: 0 }}>
                  <div className="tf-compare-item">
                    <button 
                      className="remove-compare-item" 
                      onClick={() => removeItem(product)}
                      aria-label="Remove item"
                      style={{ 
                        top: "-5px", 
                        right: "-14px", 
                        borderRadius: "50%",
                        width: "28px",
                        height: "28px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#ff3040",
                        color: "#fff",
                        border: "none",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        padding: 0,
                        lineHeight: 1
                      }}
                    >
                      <i className="icon icon-close" style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        fontSize: "12px",
                        width: "100%",
                        height: "100%",
                        margin: 0
                      }}></i>
                    </button>
                    <div className="image-container">
                    <Link
                      className="tf-compare-image"
                        href={`/product-detail/${product.documentId || product.id}`}
                    >
                      <Image
                          className="lazyload product-compare-img"
                          alt={product.title || "Product image"}
                          src={product.imgSrc || DEFAULT_IMAGE}
                          width={180}
                          height={220}
                          style={{ objectFit: "cover", borderRadius: "8px" }}
                      />
                    </Link>
                    </div>
                    <div className="tf-compare-content">
                      <Link
                        className="link text-title text-line-clamp-1"
                        href={`/product-detail/${product.documentId || product.id}`}
                      >
                        {product.title}
                      </Link>
                      <p className="desc text-caption-1">
                        {product.category}, {product.collection}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Rating Row */}
            <div className="tf-compare-row">
              <div className="tf-compare-col tf-compare-field d-md-block d-none">
                <h6>Rating</h6>
              </div>
              {items.map((product, i) => (
                <div
                  key={i}
                  className="tf-compare-col tf-compare-field tf-compare-rate"
                  style={{ borderTopLeftRadius: 0 }}
                >
                  <div className="list-star">
                    {ratings[product.documentId] !== null && ratings[product.documentId] !== undefined ? (
                      <>
                    {[...Array(5)].map((_, index) => (
                      <span 
                        key={index} 
                            className={`icon icon-star ${index < Math.round(ratings[product.documentId] || 0) ? '' : 'inactive'}`}
                            style={{ fontSize: '1.25rem', color: index < Math.round(ratings[product.documentId] || 0) ? '#FF9900' : '#FFB400', opacity: index < Math.round(ratings[product.documentId] || 0) ? 1 : 0.2, marginRight: 2 }}
                          />
                        ))}
                        <span style={{marginLeft: 4, fontWeight: 400, fontSize: '1rem', color: '#333'}}>
                          ({ratingCounts[product.documentId]})
                        </span>
                      </>
                    ) : (
                      <span style={{fontWeight: 500, fontSize: '1rem'}}>No rating</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Row */}
            <div className="tf-compare-row">
              <div className="tf-compare-col tf-compare-field d-md-block d-none">
                <h6>Price</h6>
              </div>
              {items.map((product, i) => (
                <div key={i} className="tf-compare-col tf-compare-field">
                  <div style={{fontWeight: 600, fontSize: '1.1rem'}}>
                    {product.oldPrice && (
                      <span style={{textDecoration: 'line-through', color: '#888888', marginRight: 6}}>
                        ${product.oldPrice}
                      </span>
                    )}
                    <span style={{color: '#219150'}}>${product.price}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Size Row */}
            <div className="tf-compare-row">
              <div className="tf-compare-col tf-compare-field d-md-block d-none">
                <h6>Size</h6>
              </div>
              {items.map((product, i) => (
                <div key={i} className="tf-compare-col tf-compare-field">
                  <span>{Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes}</span>
                </div>
              ))}
            </div>

            {/* Color Row */}
            <div className="tf-compare-row">
              <div className="tf-compare-col tf-compare-field d-md-block d-none">
                <h6>Color</h6>
              </div>
              {items.map((product, i) => (
                <div key={i} className="tf-compare-col tf-compare-field" style={{display: 'flex', alignItems: 'center', gap: 16, minHeight: 48}}>
                  {Array.isArray(product.colors) && product.colors.length > 0 ? (
                    product.colors.map((color, idx) => {
                      if (typeof color === 'object' && color.imgSrc) {
                        return (
                          <img
                            key={idx}
                            src={color.imgSrc}
                            alt={color.name || 'color'}
                            title={color.name || 'color'}
                            style={{width: 36, height: 36, borderRadius: '50%', border: '1.5px solid #ccc', objectFit: 'cover', marginRight: 0}}
                          />
                        );
                      } else if (typeof color === 'object' && color.name) {
                        // fallback to color swatch if only name
                        return (
                          <span
                            key={idx}
                            style={{display: 'inline-block', width: 36, height: 36, borderRadius: '50%', background: color.name.toLowerCase(), border: '1.5px solid #ccc', marginRight: 0}}
                            title={color.name}
                          ></span>
                        );
                      } else if (typeof color === 'string') {
                        return (
                          <span
                            key={idx}
                            style={{display: 'inline-block', width: 36, height: 36, borderRadius: '50%', background: color.toLowerCase(), border: '1.5px solid #ccc', marginRight: 0}}
                            title={color}
                          ></span>
                        );
                      } else {
                        return (
                          <span
                            key={idx}
                            style={{display: 'inline-block', width: 36, height: 36, borderRadius: '50%', background: 'gray', border: '1.5px solid #ccc', marginRight: 0}}
                            title="Unknown"
                          ></span>
                        );
                      }
                    })
                  ) : (
                    <span style={{color: '#888'}}>—</span>
                  )}
                </div>
              ))}
            </div>

            {/* Add to Cart Row */}
            <div className="tf-compare-row">
              <div className="tf-compare-col tf-compare-field d-md-block d-none">
                <h6>Add to Cart</h6>
              </div>
              {items.map((product, i) => (
                <div key={i} className="tf-compare-col tf-compare-field">
                  <button
                    className="btn-style-2 text-btn-uppercase fw-6 btn-add-to-cart"
                    style={{height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 22px', width: 'auto', minWidth: 140}}
                    onClick={() => {
                      if (isAddedToCartProducts && isAddedToCartProducts(product.documentId || product.id)) {
                        openCartModal().catch(console.error);
                      } else {
                        handleAddToCart(product.documentId || product.id);
                      }
                    }}
                    disabled={false}
                  >
                    {isAddedToCartProducts && isAddedToCartProducts(product.documentId || product.id) ? 'Already added' : 'Add to Cart'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
        @media (max-width: 600px) {
          .product-compare-img {
            width: 100px !important;
            height: 120px !important;
            min-width: 100px !important;
            min-height: 120px !important;
            max-width: 100%;
            object-fit: cover;
            border-radius: 8px;
          }
          .tf-compare-item .image-container,
          .tf-compare-item .tf-compare-image {
            height: auto !important;
            min-height: unset !important;
            max-height: unset !important;
          }
          .tf-compare-item .image-container {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
          }
        }
        .compare-spinner {
          display: inline-block;
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #FF9900;
          border-radius: 50%;
          animation: compare-spin 1s linear infinite;
          margin: 0 auto;
        }
        @keyframes compare-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}