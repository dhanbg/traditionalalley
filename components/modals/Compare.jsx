"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useContextElement } from "@/context/Context";
import { fetchDataFromApi, getOptimizedImageUrl } from "@/utils/api";
import { API_URL } from "@/utils/urls";

// Default placeholder image
const DEFAULT_IMAGE = '/images/placeholder.jpg';

export default function Compare() {
  const { removeFromCompareItem, compareItem, setCompareItem } =
    useContextElement();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const prevCompareLength = useRef(compareItem.length);

  useEffect(() => {
    const fetchCompareProducts = async () => {
      if (!compareItem || compareItem.length === 0) {
        setItems([]);
        setLoading(false);
        prevCompareLength.current = 0;
        return;
      }
      
      if (compareItem.length > prevCompareLength.current) {
        setLoading(true);
      }
      try {
        // Create an array to track valid products
        const validProducts = [];
        const invalidIds = [];
        
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
            
            // Get optimized image URL
            const imgSrc = getOptimizedImageUrl(attrs.imgSrc) || DEFAULT_IMAGE;
            
            // Check if we already have this product in the validProducts array
            const isDuplicate = validProducts.some(
              p => p.id === productId || p.documentId === attrs.documentId
            );
            
            if (!isDuplicate) {
              // First get basic product info
              const productToAdd = {
                id: productId,
                documentId: attrs.documentId || productId,
                originalId: id, // Store the original ID used to fetch the product
                title: attrs.title || "Product",
                colors: attrs.colors || [],
                price: attrs.price || 0,
                oldPrice: attrs.oldPrice,
                imgSrc: imgSrc,
                collection: attrs.collection?.name || "Collection", // Add collection name
                category: attrs.collection?.category?.title || "Category" // Add category from collection
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
                    productToAdd.collection = collectionData.name || collectionData.attributes?.name || "Collection";
                    productToAdd.category = collectionData.category?.title || collectionData.attributes?.category?.title || "Category";
                  }
                } catch (error) {
                }
              }
              
              // Store the colors to use in the modal display, if available
              if (attrs.colors && Array.isArray(attrs.colors) && attrs.colors.length > 0) {
                productToAdd.colors = attrs.colors;
              }
              
              validProducts.push(productToAdd);
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
        setLoading(false);
        prevCompareLength.current = compareItem.length;
      } catch (error) {
        setLoading(false);
        prevCompareLength.current = compareItem.length;
      }
    };
    
    fetchCompareProducts();
  }, [compareItem, setCompareItem]);

  const removeItem = (product) => {
    // Use the original ID that was used to fetch the product
    // This ensures we're removing the correct item from the compareItem array
    const idToRemove = product.originalId || product.documentId || product.id;
    removeFromCompareItem(idToRemove);
  };

  return (
    <div className="offcanvas offcanvas-bottom offcanvas-compare" id="compare">
      <div className="offcanvas-content">
        <div className="header">
          <span
            className="icon-close icon-close-popup"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </div>
        <div className="row gx-0">
          <div className="col-12">
            <div className="row gx-0">
              <div className="col-12">
                <div className="comare-item" style={{ padding: '10px 25px 0' }}>
                  <h3
                    className="offcanvas-title text-heading-2"
                    style={{
                      marginBottom: '15px',
                      fontSize: '22px',
                      textAlign: 'center',
                      paddingTop: '20px'
                    }}
                  >
                    Compare Products
                  </h3>
                </div>
              </div>
                  </div>
            <div className="row gx-0 align-items-center tf-compare-header">
              <div className="col-12">
                <div className="compare-list" style={{ padding: '0 15px 15px' }}>
                  {loading ? (
                    <div className="text-center py-4">Loading...</div>
                  ) : items.length > 0 ? (
                    <div className="d-flex" style={{ flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                      <div className="compare-wrapper" style={{ 
                        display: 'flex', 
                        gap: '12px', 
                        justifyContent: 'flex-start',
                        overflowX: 'auto',
                        whiteSpace: 'nowrap',
                        padding: '5px 0',
                        flex: '1',
                        flexWrap: 'nowrap',
                        width: '100%',
                        minHeight: '1px'
                      }}>
                        {items.map((product, index) => (
                          <div key={index} className="compare-item" style={{ 
                            position: 'relative',
                            borderRadius: '8px',
                            border: '1px solid #e6e6e6',
                            padding: '15px',
                            width: '280px',
                            minWidth: '280px',
                            flexShrink: 0,
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: '12px'
                          }}>
                            <button 
                              type="button"
                              className="remove-compare-item"
                              onClick={() => removeItem(product)}
                              aria-label="Remove item"
                              style={{ 
                                position: 'absolute',
                                zIndex: 2,
                                top: "-10px", 
                                right: "-10px", 
                                borderRadius: "50%",
                                width: "24px",
                                height: "24px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "#ff3040",
                                color: "#fff",
                                border: "none",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                padding: 0,
                                lineHeight: 1,
                                cursor: 'pointer'
                              }}
                            >
                              <i className="icon icon-close" style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center",
                                fontSize: "10px",
                                width: "100%",
                                height: "100%",
                                margin: 0,
                                position: "relative",
                                left: "0",
                                top: "0"
                              }}></i>
                            </button>
                            <div className="image-container" style={{ 
                              width: '100px', 
                              height: '120px',
                              flexShrink: 0,
                              borderRadius: '6px',
                              overflow: 'hidden'
                            }}>
                              <Link href={`/product-detail/${product.documentId || product.id}`} style={{
                                display: 'block',
                                width: '100%',
                                height: '100%'
                              }}>
                            <Image
                                  className="product-image product-compare-img"
                                  src={product.imgSrc || DEFAULT_IMAGE}
                                  alt={product.title}
                                  width={100}
                                  height={120}
                                  style={{ 
                                    objectFit: "cover", 
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '6px'
                                  }}
                            />
                          </Link>
                            </div>
                            <div className="product-compare-content" style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '5px',
                              flex: '1',
                              overflow: 'hidden',
                              maxWidth: '120px',
                              textAlign: 'left'
                            }}>
                              <Link
                                className="product-title"
                                href={`/product-detail/${product.documentId || product.id}`}
                                style={{
                                  fontWeight: '500',
                                  fontSize: '15px',
                                  lineHeight: '1.3',
                                  color: '#333',
                                  textDecoration: 'none',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  maxWidth: '120px',
                                  textAlign: 'left'
                                }}
                              >
                                {product.title}
                              </Link>
                              <p className="product-price" style={{
                                margin: '0',
                                fontSize: '15px',
                                fontWeight: '600',
                                color: '#333',
                                display: 'flex',
                                alignItems: 'center'
                              }}>
                                ${parseFloat(product.price).toFixed(2)}
                                {product.oldPrice && (
                                  <span style={{
                                    marginLeft: '6px',
                                    fontSize: '13px',
                                    textDecoration: 'line-through',
                                    color: '#999'
                                  }}>${parseFloat(product.oldPrice).toFixed(2)}</span>
                                )}
                              </p>
                          </div>
                        </div>
                      ))}
                    </div>
                      <div className="tf-compare-buttons tf-compare-buttons-wrap" style={{
                        marginTop: '12px',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        gap: '10px',
                        width: '100%',
                        flexShrink: 0
                      }}>
                        <Link
                          href={`/compare-products`}
                          className="tf-btn btn-fill radius-4"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '6px 10px',
                            fontSize: '12px',
                            textDecoration: 'none',
                            width: 'auto',
                            minWidth: '110px',
                            height: '36px'
                          }}
                        >
                          <span className="text text-btn-uppercase">
                            Compare
                          </span>
                        </Link>
                        <button
                          onClick={() => setCompareItem([])}
                          className="tf-compapre-button-clear-all clear-file-delete tf-btn btn-white radius-4 has-border"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '6px 10px',
                            fontSize: '12px',
                            background: 'transparent',
                            border: '1px solid #ddd',
                            cursor: 'pointer',
                            width: 'auto',
                            minWidth: '110px',
                            height: '36px'
                          }}
                        >
                          <span className="text text-btn-uppercase">
                            Clear
                          </span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      No items added to compare yet.
                  </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
