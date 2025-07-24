"use client";

import LayoutHandler from "./LayoutHandler";
import Sorting from "./Sorting";
import Listview from "./Listview";
import GridView from "./GridView";
import { useEffect, useReducer, useState } from "react";
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
import { fetchProductsWithVariantsByCategory } from "@/utils/productVariantUtils";

// Default placeholder image
const DEFAULT_IMAGE = '/logo.png';

export default function Products({ parentClass = "flat-spacing", collection, categoryId, categoryTitle }) {
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
    colors: [],
    sizes: [],
    availabilityOptions: [
      { id: "inStock", label: "In stock", count: 0, value: true },
      { id: "outStock", label: "Out of stock", count: 0, value: false }
    ],
    priceRange: [20, 300]
  });

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

    // If categoryId and categoryTitle are provided, fetch all products for that category
    if (categoryId && categoryTitle) {
      fetchProductsByCategory();
    }
  }, [categoryId, categoryTitle]);

  // Fetch collection by slug and get its products
  useEffect(() => {
    const fetchCollectionProducts = async () => {
      try {
        // Use the collection slug to fetch the specific collection
        const response = await fetchDataFromApi(COLLECTION_BY_SLUG_API(collection));
        
        if (response.data && response.data.length > 0) {
          // Get the first matching collection
          const collectionItem = response.data[0];
          setCollectionData([collectionItem]);
          
          // Products are directly in the collection.products array
          const products = collectionItem.products || [];
          
          // Extract document IDs from products
          const productDocumentIds = products.map(product => product.documentId);
          
          setCollectionProducts(products);
          
          // Fetch product details for each document ID
          await fetchProductsByDocumentIds(productDocumentIds);
        }
      } catch (error) {
        // Silently handle error - removed console.error
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
        
        // Process colors to ensure they're in the correct format - convert string arrays to objects
        let processedColors = null;
        
        if (Array.isArray(product.colors)) {
          // If colors is a simple array of strings, convert to objects with color names
          if (typeof product.colors[0] === 'string') {
            processedColors = product.colors.map(color => ({
              name: color,
              bgColor: `bg-${color.toLowerCase().replace(/\s+/g, '-')}`,
              // We don't have actual color images, so use the main product image
              imgSrc: imgSrc
            }));
          } else {
            // If colors is already an array of objects, use as is
            processedColors = product.colors;
          }
        }
        
        // Extract gallery images if available
        const gallery = Array.isArray(product.gallery) 
          ? product.gallery.map(img => {
              if (!img) return { id: 0, url: DEFAULT_IMAGE };
              
              let imageUrl = DEFAULT_IMAGE;
              if (img.formats && img.formats.medium) {
                imageUrl = getImageUrl(img.formats.medium.url);
              } else if (img.url) {
                imageUrl = getImageUrl(img.url);
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
          colors: processedColors,
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
    color,
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

    setColor: (value) => {
      if (value && typeof value === 'object' && value.name) {
        if (color && color.name === value.name) {
          dispatch({ type: "SET_COLOR", payload: { name: "All", className: "", imgSrc: null } });
        } else {
          // Make sure we have all required properties
          const colorPayload = {
            name: value.name,
            className: value.className || `bg-${value.name.toLowerCase().replace(/\s+/g, '-')}`,
            imgSrc: value.imgSrc || null
          };
          dispatch({ type: "SET_COLOR", payload: colorPayload });
        }
      } else {
        dispatch({ type: "SET_COLOR", payload: { name: "All", className: "", imgSrc: null } });
      }
    },
    
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
    
        // Filter by color
        if (
          state.color && 
          state.color.name !== "All" &&
          (!product.colors || !Array.isArray(product.colors))
        ) {
          return false;
        }
        
        // Check if product color matches selected color
        if (state.color && state.color.name !== "All" && Array.isArray(product.colors)) {
          const colorMatch = product.colors.some(c => {
            if (typeof c === 'string') {
              return c === state.color.name;
            } else if (c && typeof c === 'object' && c.name) {
              return c.name === state.color.name;
            }
            return false;
          });
          
          if (!colorMatch) return false;
        }
    
        // Filter by size
        if (
          state.size !== "All" &&
          (!product.sizes || !Array.isArray(product.sizes))
        ) {
          return false;
        }
        
        // Check if product size matches selected size
        if (state.size !== "All" && Array.isArray(product.sizes)) {
          const sizeMatch = product.sizes.some(s => {
            if (typeof s === 'string') {
              return s === state.size;
            } else if (s && typeof s === 'object' && s.name) {
              return s.name === state.size;
            }
            return false;
          });
          
          if (!sizeMatch) return false;
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

  const handleLoad = () => {
    if (!sorted || !Array.isArray(sorted) || loadedItems.length >= sorted.length) {
      return; // No more items to load
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
  };

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

  // Set the initial collection filter from URL parameters
  useEffect(() => {
    const collectionId = searchParams.get('collectionId');
    if (collectionId) {
      // Check if it's a valid number before setting
      const id = parseInt(collectionId, 10);
      if (!isNaN(id)) {
        // Set the collection filter
        dispatch({ type: "SET_COLLECTIONS", payload: [id] });
      }
    }
  }, [searchParams]);

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

            {activeLayout == 1 ? (
              <div className="tf-list-layout wrapper-shop" id="listLayout">
                <Listview pagination={false} products={loadedItems} />
                {(productDetails.length > 0 && loadedItems.length === productDetails.length) || 
                 (productDetails.length === 0 && sorted.length === loadedItems.length) ? (
                  ""
                ) : (
                  <button
                    className={`load-more-btn btn-out-line tf-loading ${
                      loading ? "loading" : ""
                    } `}
                  >
                    <span className="text-btn">Load more</span>
                  </button>
                )}
              </div>
            ) : (
              <div
                className={`tf-grid-layout wrapper-shop tf-col-${activeLayout}`}
                id="gridLayout"
              >
                <GridView pagination={false} products={loadedItems} />
                {(productDetails.length > 0 && loadedItems.length === productDetails.length) || 
                 (productDetails.length === 0 && sorted.length === loadedItems.length) ? (
                  ""
                ) : (
                  <div
                    className="wd-load d-flex justify-content-center"
                    onClick={() => handleLoad()}
                  >
                    <button
                      className={`load-more-btn btn-out-line tf-loading ${
                        loading ? "loading" : ""
                      } `}
                    >
                      <span className="text-btn">Load more</span>
                    </button>
                  </div>
                )}
              </div>
            )}
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
          color: state.color,
          setColor: (color) => {
            if (color && typeof color === 'object') {
              dispatch({ type: "SET_COLOR", payload: color });
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
