"use client";

import LayoutHandler from "./LayoutHandler";
import Sorting from "./Sorting";
import Listview from "./Listview";
import GridView from "./GridView";
import { useEffect, useReducer, useState, useRef, useCallback } from "react";
import FilterModal from "./FilterModal";
import { initialState, reducer } from "@/reducer/filterReducer";
import { productWomen } from "@/data/productsWomen";
import FilterMeta from "./FilterMeta";
import { fetchDataFromApi, fetchFilterOptions } from "@/utils/api";
import { COLLECTIONS_API, COLLECTION_BY_SLUG_API, PRODUCTS_API, PRODUCT_BY_DOCUMENT_ID_API } from "@/utils/urls";
import { calculateInStock } from "@/utils/stockUtils";
import { getImageUrl } from "@/utils/imageUtils";
import { useSearchParams } from 'next/navigation';
import { getBestImageUrl } from "@/utils/imageUtils";
import { fetchProductsWithVariantsByCategory, fetchProductsWithVariantsByCollection } from "@/utils/productVariantUtils";

// Default placeholder image
const DEFAULT_IMAGE = '/logo.png';

export default function Products({ parentClass = "flat-spacing", collection, categoryId, categoryTitle, collectionId }) {
  const searchParams = useSearchParams();
  const [activeLayout, setActiveLayout] = useState(4);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [loading, setLoading] = useState(false);
  const [collectionData, setCollectionData] = useState([]);
  const [collectionProducts, setCollectionProducts] = useState([]);
  const [productDetails, setProductDetails] = useState([]);

  const [loadedItems, setLoadedItems] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    sizes: [],
    availabilityOptions: [
      { id: "inStock", label: "In stock", count: 0, value: true },
      { id: "outStock", label: "Out of stock", count: 0, value: false }
    ],
    priceRange: [20, 300]
  });
  
  // Ref for intersection observer
  const loadMoreRef = useRef(null);

  // Fetch all products with variants for a category
  useEffect(() => {
    const fetchProductsByCategory = async () => {
      try {
        setLoading(true);
        
        // Use the new utility to fetch products with their variants as separate items
        const productsWithVariants = await fetchProductsWithVariantsByCategory(categoryTitle);
        
        if (productsWithVariants && productsWithVariants.length > 0) {
          // Filter out inactive products and variants
          const activeItems = productsWithVariants.filter(item => item.isActive !== false);
          
          setProductDetails(activeItems);
          
          // Update the filtered and sorted state with the products and variants
          dispatch({ type: "SET_FILTERED", payload: activeItems });
          dispatch({ type: "SET_SORTED", payload: activeItems });
        } else {
          // No products found
          setProductDetails([]);
          dispatch({ type: "SET_FILTERED", payload: [] });
          dispatch({ type: "SET_SORTED", payload: [] });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products with variants:', error);
        setProductDetails([]);
        dispatch({ type: "SET_FILTERED", payload: [] });
        dispatch({ type: "SET_SORTED", payload: [] });
        setLoading(false);
      }
    };

    // If categoryId and categoryTitle are provided, and no collectionId, fetch all products for that category
    if (categoryId && categoryTitle && !collectionId) {
      fetchProductsByCategory();
    }
  }, [categoryId, categoryTitle, collectionId]);

  // Fetch collection products by ID
  useEffect(() => {
    const fetchCollectionProductsById = async () => {
      try {
        setLoading(true);
        
        // Fetch the specific collection by ID using the existing collections API with filter
        const response = await fetchDataFromApi(`/api/collections?filters[id][$eq]=${collectionId}&populate=*`);
        
        if (!response.data || response.data.length === 0) {
          throw new Error('Collection not found');
        }
        
        if (response.data) {
          const collectionItem = response.data[0]; // Get the first (and should be only) collection
          setCollectionData([collectionItem]);
          
          // Products are directly in the collection.products array
          const products = collectionItem.products || [];
          
          if (products.length > 0) {
            // Extract document IDs from products
            const productDocumentIds = products.map(product => product.documentId).filter(Boolean);
            
            if (productDocumentIds.length > 0) {
              // Fetch detailed product information for each product
              const productPromises = productDocumentIds.map(documentId => 
                fetchDataFromApi(PRODUCT_BY_DOCUMENT_ID_API(documentId))
              );
              
              const productResponses = await Promise.all(productPromises);
              
              // Extract and transform product data
              const transformedProducts = productResponses.map(response => {
                if (!response.data || response.data.length === 0) return null;
                
                const product = response.data[0];
                
                // Extract image URLs with proper formatting
                let imgSrc = getBestImageUrl(product.imgSrc, 'medium') || DEFAULT_IMAGE;
                let imgHover = getBestImageUrl(product.imgHover, 'medium') || imgSrc;
                

                
                // Extract gallery images
                const gallery = Array.isArray(product.gallery) 
                  ? product.gallery.map(img => {
                      if (!img) return { id: 0, url: DEFAULT_IMAGE };
                      
                      let imageUrl = DEFAULT_IMAGE;
                      if (img.formats && img.formats.medium) {
                        imageUrl = getImageUrl(img.formats.medium.url);
                      } else if (img.url) {
                        imageUrl = getImageUrl(img.url);
                      }
                      
                      imageUrl = imageUrl || DEFAULT_IMAGE;
                      
                      return {
                        id: img.id || img.documentId || 0,
                        url: imageUrl
                      };
                    }) 
                  : [];
                
                const sizes = product.sizes || product.filterSizes || [];
                
                const transformedProduct = {
                  ...product,
                  id: product.id || product.documentId || Math.random().toString(36).substring(7),
                  imgSrc,
                  imgHover,
                  gallery,

                  sizes,
                  title: product.title || "Untitled Product",
                  price: product.price || 0,
                  oldPrice: product.oldPrice || null,
                  isOnSale: !!product.oldPrice,
                  salePercentage: product.salePercentage || "25%"
                };
                
                transformedProduct.inStock = calculateInStock(transformedProduct);
                
                return transformedProduct;
              }).filter(Boolean);
              
              setProductDetails(transformedProducts);
              dispatch({ type: "SET_FILTERED", payload: transformedProducts });
              dispatch({ type: "SET_SORTED", payload: transformedProducts });
            }
          } else {
            setProductDetails([]);
            dispatch({ type: "SET_FILTERED", payload: [] });
            dispatch({ type: "SET_SORTED", payload: [] });
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching collection products by ID:', error);
        setProductDetails([]);
        dispatch({ type: "SET_FILTERED", payload: [] });
        dispatch({ type: "SET_SORTED", payload: [] });
        setLoading(false);
      }
    };

    // If collectionId is provided, fetch collection products by ID
    if (collectionId) {
      fetchCollectionProductsById();
    }
  }, [collectionId]);

  // Fetch collection by slug and get its products
  useEffect(() => {
    const fetchCollectionProducts = async () => {
      try {
        setLoading(true);
        
        // Use the new function that fetches products with variants for collections
        const productsWithVariants = await fetchProductsWithVariantsByCollection(collection);
        
        if (productsWithVariants && productsWithVariants.length > 0) {
          // Set the products directly since they're already transformed
          setProductDetails(productsWithVariants);
          
          // Update the filtered and sorted state
          dispatch({ type: "SET_FILTERED", payload: productsWithVariants });
          dispatch({ type: "SET_SORTED", payload: productsWithVariants });
        }
        
        setLoading(false);
      } catch (error) {
        // Silently handle error - removed console.error
        setLoading(false);
      }
    };

    if (collection && !categoryId) {
      fetchCollectionProducts();
    }
  }, [collection, categoryId]);
  
  // Function to fetch product details by document IDs
  const fetchProductsByDocumentIds = async (documentIds) => {
    try {
      setLoading(true);
      
      // Create an array of promises for each product fetch
      const productPromises = documentIds.map(documentId => 
        fetchDataFromApi(`/api/products?filters[documentId][$eq]=${documentId}&populate=*`)
      );
      
      // Wait for all promises to resolve
      const productsResponses = await Promise.all(productPromises);
      
      // Process the responses to extract product details
      const fetchedProducts = productsResponses
        .filter(response => {
          // Check if we have valid data
          return response && 
                 (response.data || response.data === 0) && 
                 (Array.isArray(response.data) ? response.data.length > 0 : true);
        })
        .map(response => {
          // Handle both array and direct object responses
          return Array.isArray(response.data) ? response.data[0] : response.data;
        });
      
      // Transform the products to match the expected structure for ProductCard components
      const transformedProducts = fetchedProducts.map(product => {
        // Skip processing if product is undefined or null
        if (!product) {
          return null;
        }
        
        // Extract image URLs with proper formatting based on the API response structure
        let imgSrc = getBestImageUrl(product.imgSrc, 'medium') || DEFAULT_IMAGE;
        
        // Handle hover image similarly
        let imgHover = getBestImageUrl(product.imgHover, 'medium') || imgSrc;
        

        
        // Extract gallery images if available
        const gallery = Array.isArray(product.gallery) 
          ? product.gallery.map(img => {
              if (!img) return { id: 0, url: DEFAULT_IMAGE };
              
              let imageUrl = DEFAULT_IMAGE;
              if (img.formats && img.formats.medium && img.formats.medium.url) {
                const mediumUrl = img.formats.medium.url;
                imageUrl = mediumUrl.startsWith('http') ? mediumUrl : getImageUrl(mediumUrl);
              } else if (img.url) {
                imageUrl = img.url.startsWith('http') ? img.url : getImageUrl(img.url);
              }
              
              // Ensure gallery image URL is never an empty string
              imageUrl = imageUrl || DEFAULT_IMAGE;
              
              return {
                id: img.id || img.documentId || 0,
                url: imageUrl
              };
            }) 
          : [];
        
        // Make sure filterSizes is converted to sizes if sizes is null
        const sizes = product.sizes || product.filterSizes || [];
        
        const transformedProduct = {
          ...product,
          id: product.id || product.documentId || Math.random().toString(36).substring(7),
          imgSrc,
          imgHover,
          gallery,

          sizes,
          // Make sure other required fields are present
          title: product.title || "Untitled Product",
          price: product.price || 0,
          oldPrice: product.oldPrice || null,
          isOnSale: !!product.oldPrice,
          salePercentage: product.salePercentage || "25%"
        };
        
        // Calculate inStock based on size_stocks
        transformedProduct.inStock = calculateInStock(transformedProduct);
        
        return transformedProduct;
      }).filter(Boolean); // Remove any null values from the array
      
      setProductDetails(transformedProducts);
      
      // Update the filtered and sorted state with the transformed products
      dispatch({ type: "SET_FILTERED", payload: transformedProducts });
      dispatch({ type: "SET_SORTED", payload: transformedProducts });
      
      setLoading(false);
    } catch (error) {
      // Silently handle error - removed console.error
      setLoading(false);
    }
  };

  const {
    price,
    availability,
    size,
    collections,

    filtered,
    sortingOption,
    sorted,

    activeFilterOnSale,
    currentPage,
    itemPerPage,
  } = state;

  const allProps = {
    ...state,
    setPrice: (value) => dispatch({ type: "SET_PRICE", payload: value }),


    
    setSize: (value) => {
      if (value === size) {
        dispatch({ type: "SET_SIZE", payload: "All" });
      } else {
        dispatch({ type: "SET_SIZE", payload: value });
      }
    },
    
    setAvailability: (value) => {
      if (value && typeof value === 'object' && value.id) {
        if (availability && availability.id === value.id) {
          dispatch({ type: "SET_AVAILABILITY", payload: { id: "all", label: "All", value: null } });
        } else {
          dispatch({ type: "SET_AVAILABILITY", payload: value });
        }
      } else {
        dispatch({ type: "SET_AVAILABILITY", payload: { id: "all", label: "All", value: null } });
      }
    },

    setCollection: (collectionId) => {
      if (!collectionId) return;
      
      const updatedCollections = state.collections.includes(collectionId)
        ? state.collections.filter((id) => id !== collectionId)
        : [...state.collections, collectionId];
        
      dispatch({ type: "SET_COLLECTIONS", payload: updatedCollections });
    },
    
    removeCollection: (collectionId) => {
      const updatedCollections = state.collections.filter(id => id !== collectionId);
      dispatch({ type: "SET_COLLECTIONS", payload: updatedCollections });
    },
    
    setSortingOption: (value) =>
      dispatch({ type: "SET_SORTING_OPTION", payload: value }),
      
    toggleFilterWithOnSale: () => dispatch({ type: "TOGGLE_FILTER_ON_SALE" }),
    
    setCurrentPage: (value) =>
      dispatch({ type: "SET_CURRENT_PAGE", payload: value }),
      
    setItemPerPage: (value) => {
      dispatch({ type: "SET_CURRENT_PAGE", payload: 1 });
        dispatch({ type: "SET_ITEM_PER_PAGE", payload: value });
    },
    
    clearFilter: () => {
      dispatch({ type: "CLEAR_FILTER" });
    },
  };

  // Filter products
  useEffect(() => {
    let filteredArray = [];
    
    // If we have products from API, filter them based on selected filters
    if (productDetails && Array.isArray(productDetails) && productDetails.length > 0) {
      filteredArray = productDetails.filter((product) => {
        // Skip invalid products
        if (!product) return false;
        
        // Filter by price
        const productPrice = typeof product.price === 'number' ? product.price : 0;
        if (
          productPrice < state.price[0] ||
          productPrice > state.price[1]
        ) {
          return false;
        }
    
        // Hide products that are inactive (isActive = false)
        if (product.isActive !== true) {
          return false;
        }
    

    
        // Filter by size using size_stocks (only show products with available stock for selected size)
        if (state.size !== "All") {
          let sizeAvailable = false;
          
          // Check main product size_stocks
          if (product.size_stocks && typeof product.size_stocks === 'object') {
            const stock = product.size_stocks[state.size];
            if (stock && stock > 0) {
              sizeAvailable = true;
            }
          }
          
          // Check product variants size_stocks if not found in main product
          if (!sizeAvailable && product.product_variants && Array.isArray(product.product_variants)) {
            for (const variant of product.product_variants) {
              if (variant && variant.size_stocks && typeof variant.size_stocks === 'object') {
                const stock = variant.size_stocks[state.size];
                if (stock && stock > 0) {
                  sizeAvailable = true;
                  break;
                }
              }
            }
          }
          
          if (!sizeAvailable) return false;
        }
    
        // Filter by collections
        if (
          state.collections && 
          Array.isArray(state.collections) && 
          state.collections.length > 0
        ) {
          if (!product.collection || !product.collection.id) {
            return false;
          }
          
          // Check if product collection is in the selected collections
          const collectionMatch = state.collections.includes(product.collection.id);
          if (!collectionMatch) return false;
        }
    
        // Filter by "on sale" status
        if (state.activeFilterOnSale && !product.isOnSale) {
          return false;
        }
    
        return true;
      });
    }

    dispatch({ type: "SET_FILTERED", payload: filteredArray });
  }, [
    state.price,
    state.availability,
    state.color,
    state.size,
    state.collections,
    state.activeFilterOnSale,
    productDetails,
  ]);

  // Sort products based on selected sorting option
  useEffect(() => {
    if (!filtered || !Array.isArray(filtered) || filtered.length === 0) {
      dispatch({ type: "SET_SORTED", payload: [] });
      return;
    }

    let sortedProducts = [...filtered];
    
    if (sortingOption === "Price Ascending") {
      sortedProducts = sortedProducts.sort((a, b) => {
        // Handle undefined or non-numeric prices
        const priceA = typeof a.price === 'number' ? a.price : 0;
        const priceB = typeof b.price === 'number' ? b.price : 0;
        return priceA - priceB;
      });
    } else if (sortingOption === "Price Descending") {
      sortedProducts = sortedProducts.sort((a, b) => {
        // Handle undefined or non-numeric prices
        const priceA = typeof a.price === 'number' ? a.price : 0;
        const priceB = typeof b.price === 'number' ? b.price : 0;
        return priceB - priceA;
      });
    } else if (sortingOption === "Title Ascending") {
      sortedProducts = sortedProducts.sort((a, b) => {
        // Handle undefined titles
        const titleA = typeof a.title === 'string' ? a.title : "";
        const titleB = typeof b.title === 'string' ? b.title : "";
        return titleA.localeCompare(titleB);
      });
    } else if (sortingOption === "Title Descending") {
      sortedProducts = sortedProducts.sort((a, b) => {
        // Handle undefined titles
        const titleA = typeof a.title === 'string' ? a.title : "";
        const titleB = typeof b.title === 'string' ? b.title : "";
        return titleB.localeCompare(titleA);
      });
    }
    
    dispatch({ type: "SET_SORTED", payload: sortedProducts });
    dispatch({ type: "SET_CURRENT_PAGE", payload: 1 });
  }, [filtered, sortingOption]);

  // Update loaded items when sorted items change
  useEffect(() => {
    if (!sorted || !Array.isArray(sorted)) {
      setLoadedItems([]);
      return;
    }
    
    // Initialize with first batch of items
    setLoadedItems(sorted.slice(0, 8));
  }, [sorted]);

  const handleLoad = useCallback(() => {
    if (!sorted || !Array.isArray(sorted) || loadedItems.length >= sorted.length || loading) {
      return; // No more items to load or already loading
    }
    
    setLoading(true);
    
    setTimeout(() => {
      // Load more products from the sorted items
      setLoadedItems((pre) => [
        ...pre,
        ...sorted.slice(pre.length, pre.length + 4),
      ]);
      
      setLoading(false);
    }, 1000);
  }, [sorted, loadedItems.length, loading]);
  
  // Intersection Observer for auto-loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          handleLoad();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    );
    
    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [handleLoad]);

  // Fetch filter options for this category
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        if (categoryTitle) {
          const options = await fetchFilterOptions(categoryTitle);
          
          // Only update if we got valid data
          if (options) {
            setFilterOptions(options);
            
            // Update the initial price range in state if we have data from backend
            if (options.priceRange && 
                Array.isArray(options.priceRange) && 
                options.priceRange.length === 2 &&
                typeof options.priceRange[0] === 'number' &&
                typeof options.priceRange[1] === 'number') {
              dispatch({ type: "SET_PRICE", payload: options.priceRange });
            }
          }
        }
      } catch (error) {
        // Use default values if there's an error
        setFilterOptions({
          brands: [],
          colors: [],
          sizes: [],
          availabilityOptions: [
            { id: "inStock", label: "In stock", count: 0, value: true },
            { id: "outStock", label: "Out of stock", count: 0, value: false }
          ],
          priceRange: [20, 300]
        });
      }
    };
    
    loadFilterOptions();
  }, [categoryTitle]);

  // Set the initial collection filter from URL parameters or props
  useEffect(() => {
    const urlCollectionId = searchParams.get('collectionId');
    const propCollectionId = collectionId;
    
    // Use collectionId from props first, then fall back to URL params
    const targetCollectionId = propCollectionId || urlCollectionId;
    
    if (targetCollectionId) {
      // Check if it's a valid number before setting
      const id = parseInt(targetCollectionId, 10);
      if (!isNaN(id)) {
        // Set the collection filter
        dispatch({ type: "SET_COLLECTIONS", payload: [id] });
      }
    }
  }, [searchParams, collectionId]);

  return (
    <>
      <section className={parentClass}>
        <div className="container">
          <div className="tf-shop-control">
            <div className="tf-control-filter">
              <a
                href="#filterShop"
                data-bs-toggle="offcanvas"
                aria-controls="filterShop"
                className="tf-btn-filter"
              >
                <span className="icon icon-filter" />
                <span className="text">Filters</span>
              </a>
              <div
                onClick={allProps.toggleFilterWithOnSale}
                className={`d-none d-lg-flex shop-sale-text ${
                  activeFilterOnSale ? "active" : ""
                }`}
              >
                <i className="icon icon-checkCircle" />
                <p className="text-caption-1">Shop sale items only</p>
              </div>
            </div>
            <ul className="tf-control-layout">
              <LayoutHandler
                setActiveLayout={setActiveLayout}
                activeLayout={activeLayout}
              />
            </ul>
            <div className="tf-control-sorting">
              <p className="d-none d-lg-block text-caption-1">Sort by:</p>
              <Sorting allProps={allProps} />
            </div>
          </div>
          <div className="wrapper-control-shop">
            <FilterMeta 
              productLength={state.filtered ? state.filtered.length : 0} 
              allProps={{
                ...allProps,
                filterOptions: filterOptions
              }} 
            />

            {loading && loadedItems.length === 0 ? (
              <div className="d-flex justify-content-center align-items-center" style={{minHeight: '300px'}}>
                <div className="loader"></div>
              </div>
            ) : activeLayout == 1 ? (
              <div className="tf-list-layout wrapper-shop" id="listLayout">
                <Listview pagination={false} products={loadedItems} />
                {/* Auto-loading trigger element */}
                {(productDetails.length > 0 && loadedItems.length < productDetails.length) || 
                 (productDetails.length === 0 && sorted.length > loadedItems.length) ? (
                  <div ref={loadMoreRef} className="d-flex justify-content-center align-items-center py-4">
                    {loading && (
                      <div className="auto-load-spinner">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading more products...</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            ) : (
              <div
                className={`tf-grid-layout wrapper-shop tf-col-${activeLayout}`}
                id="gridLayout"
              >
                <GridView pagination={false} products={loadedItems} />
                {/* Auto-loading trigger element */}
                {(productDetails.length > 0 && loadedItems.length < productDetails.length) || 
                 (productDetails.length === 0 && sorted.length > loadedItems.length) ? (
                  <div ref={loadMoreRef} className="d-flex justify-content-center align-items-center py-4" style={{gridColumn: '1 / -1'}}>
                    {loading && (
                      <div className="auto-load-spinner">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading more products...</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}
            
            <style jsx>{`
              .loader {
                width: 50px;
                aspect-ratio: 1;
                border-radius: 50%;
                border: 8px solid #514b82;
                animation: 
                  l20-1 0.8s infinite linear alternate, 
                  l20-2 1.6s infinite linear;
              }
              @keyframes l20-1{
                 0%    {clip-path: polygon(50% 50%,0       0,  50%   0%,  50%    0%, 50%    0%, 50%    0%, 50%    0% )}
                 12.5% {clip-path: polygon(50% 50%,0       0,  50%   0%,  100%   0%, 100%   0%, 100%   0%, 100%   0% )}
                 25%   {clip-path: polygon(50% 50%,0       0,  50%   0%,  100%   0%, 100% 100%, 100% 100%, 100% 100% )}
                 50%   {clip-path: polygon(50% 50%,0       0,  50%   0%,  100%   0%, 100% 100%, 50%  100%, 0%   100% )}
                 62.5% {clip-path: polygon(50% 50%,100%    0, 100%   0%,  100%   0%, 100% 100%, 50%  100%, 0%   100% )}
                 75%   {clip-path: polygon(50% 50%,100% 100%, 100% 100%,  100% 100%, 100% 100%, 50%  100%, 0%   100% )}
                 100%  {clip-path: polygon(50% 50%,50%  100%,  50% 100%,   50% 100%,  50% 100%, 50%  100%, 0%   100% )}
              }
              @keyframes l20-2{
                0%    {transform:scaleY(1)  rotate(0deg)}
                49.99%{transform:scaleY(1)  rotate(135deg)}
                50%   {transform:scaleY(-1) rotate(0deg)}
                100%  {transform:scaleY(-1) rotate(-135deg)}
              }
            `}</style>
          </div>
        </div>
      </section>

      <FilterModal
        allProps={{
          collections: state.collections,
          setCollection: (collectionId) => {
            if (!collectionId) return;
            
            const updatedCollections = state.collections.includes(collectionId)
              ? state.collections.filter((id) => id !== collectionId)
              : [...state.collections, collectionId];
              
            dispatch({ type: "SET_COLLECTIONS", payload: updatedCollections });
          },
          price: state.price,
          setPrice: (price) => {
            if (Array.isArray(price) && price.length === 2) {
              dispatch({ type: "SET_PRICE", payload: price });
            }
          },

          size: state.size,
          setSize: (size) => {
            if (size) {
              dispatch({ type: "SET_SIZE", payload: size });
            }
          },
          availability: state.availability,
          setAvailability: (availability) => {
            if (availability && typeof availability === 'object') {
              dispatch({ type: "SET_AVAILABILITY", payload: availability });
            }
          },
          clearFilter: () => {
            dispatch({ type: "CLEAR_FILTER" });
          },
        }}
        products={state.filtered || []}
        filterOptions={filterOptions}
      />
    </>
  );
}
