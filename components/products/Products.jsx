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
import { fetchDataFromApi } from "@/utils/api";
import { COLLECTIONS_API, COLLECTION_BY_SLUG_API, PRODUCTS_API, PRODUCT_BY_DOCUMENT_ID_API, API_URL } from "@/utils/urls";

// Default placeholder image
const DEFAULT_IMAGE = '/images/placeholder.jpg';

export default function Products({ parentClass = "flat-spacing", collection }) {
  const [activeLayout, setActiveLayout] = useState(4);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState([]);
  const [collectionProducts, setCollectionProducts] = useState([]);
  const [productDetails, setProductDetails] = useState([]);

  const [loadedItems, setLoadedItems] = useState([]);

  // Fetch collection by slug and get its products
  useEffect(() => {
    const fetchCollectionProducts = async () => {
      try {
        // Use the collection slug to fetch the specific collection
        const response = await fetchDataFromApi(COLLECTION_BY_SLUG_API(collection));
        
        if (response.data && response.data.length > 0) {
          // Get the first matching collection
          const collectionData = response.data[0];
          setCollections([collectionData]);
          
          // Products are directly in the collection.products array
          const products = collectionData.products || [];
          
          // Extract document IDs from products
          const productDocumentIds = products.map(product => product.documentId);
          
          setCollectionProducts(products);
          
          // Fetch product details for each document ID
          await fetchProductsByDocumentIds(productDocumentIds);
        }
      } catch (error) {
        console.error("Error fetching collection products:", error);
      }
    };

    if (collection) {
      fetchCollectionProducts();
    }
  }, [collection]);
  
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
        let imgSrc = DEFAULT_IMAGE;
        if (product.imgSrc) {
          // Check if formats are available
          if (product.imgSrc.formats && product.imgSrc.formats.medium) {
            imgSrc = `${API_URL}${product.imgSrc.formats.medium.url}`;
          } else if (product.imgSrc.url) {
            imgSrc = `${API_URL}${product.imgSrc.url}`;
          }
        }
        
        // Ensure imgSrc is never an empty string
        imgSrc = imgSrc || DEFAULT_IMAGE;
        
        // Handle hover image similarly
        let imgHover = imgSrc; // Default to main image
        if (product.imgHover) {
          // Check if formats are available
          if (product.imgHover.formats && product.imgHover.formats.medium) {
            imgHover = `${API_URL}${product.imgHover.formats.medium.url}`;
          } else if (product.imgHover.url) {
            imgHover = `${API_URL}${product.imgHover.url}`;
          }
        }
        
        // Ensure imgHover is never an empty string
        imgHover = imgHover || imgSrc || DEFAULT_IMAGE;
        
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
                imageUrl = `${API_URL}${img.formats.medium.url}`;
              } else if (img.url) {
                imageUrl = `${API_URL}${img.url}`;
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
        
        return {
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
      }).filter(Boolean); // Remove any null values from the array
      
      setProductDetails(transformedProducts);
      
      // Update the filtered and sorted state with the transformed products
      dispatch({ type: "SET_FILTERED", payload: transformedProducts });
      dispatch({ type: "SET_SORTED", payload: transformedProducts });
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching product details:", error);
      setLoading(false);
    }
  };

  const {
    price,
    availability,
    color,
    size,
    brands,

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
      value == color
        ? dispatch({ type: "SET_COLOR", payload: "All" })
        : dispatch({ type: "SET_COLOR", payload: value });
    },
    setSize: (value) => {
      value == size
        ? dispatch({ type: "SET_SIZE", payload: "All" })
        : dispatch({ type: "SET_SIZE", payload: value });
    },
    setAvailability: (value) => {
      value == availability
        ? dispatch({ type: "SET_AVAILABILITY", payload: "All" })
        : dispatch({ type: "SET_AVAILABILITY", payload: value });
    },

    setBrands: (newBrand) => {
      const updated = [...brands].includes(newBrand)
        ? [...brands].filter((elm) => elm != newBrand)
        : [...brands, newBrand];
      dispatch({ type: "SET_BRANDS", payload: updated });
    },
    removeBrand: (newBrand) => {
      const updated = [...brands].filter((brand) => brand != newBrand);

      dispatch({ type: "SET_BRANDS", payload: updated });
    },
    setSortingOption: (value) =>
      dispatch({ type: "SET_SORTING_OPTION", payload: value }),
    toggleFilterWithOnSale: () => dispatch({ type: "TOGGLE_FILTER_ON_SALE" }),
    setCurrentPage: (value) =>
      dispatch({ type: "SET_CURRENT_PAGE", payload: value }),
    setItemPerPage: (value) => {
      dispatch({ type: "SET_CURRENT_PAGE", payload: 1 }),
        dispatch({ type: "SET_ITEM_PER_PAGE", payload: value });
    },
    clearFilter: () => {
      dispatch({ type: "CLEAR_FILTER" });
    },
  };
  useEffect(() => {
    let filteredArrays = [];

    if (brands.length) {
      const filteredByBrands = [...productWomen].filter((elm) =>
        brands.every((el) => elm.filterBrands.includes(el))
      );
      filteredArrays = [...filteredArrays, filteredByBrands];
    }
    if (availability !== "All") {
      const filteredByavailability = [...productWomen].filter(
        (elm) => availability.value === elm.inStock
      );
      filteredArrays = [...filteredArrays, filteredByavailability];
    }
    if (color !== "All") {
      const filteredByColor = [...productWomen].filter((elm) =>
        elm.filterColor.includes(color.name)
      );
      filteredArrays = [...filteredArrays, filteredByColor];
    }
    if (size !== "All" && size !== "Free Size") {
      const filteredBysize = [...productWomen].filter((elm) =>
        elm.filterSizes.includes(size)
      );
      filteredArrays = [...filteredArrays, filteredBysize];
    }
    if (activeFilterOnSale) {
      const filteredByonSale = [...productWomen].filter((elm) => elm.oldPrice);
      filteredArrays = [...filteredArrays, filteredByonSale];
    }

    const filteredByPrice = [...productWomen].filter(
      (elm) => elm.price >= price[0] && elm.price <= price[1]
    );
    filteredArrays = [...filteredArrays, filteredByPrice];

    const commonItems = [...productWomen].filter((item) =>
      filteredArrays.every((array) => array.includes(item))
    );
    dispatch({ type: "SET_FILTERED", payload: commonItems });
  }, [price, availability, color, size, brands, activeFilterOnSale]);

  useEffect(() => {
    if (sortingOption === "Price Ascending") {
      dispatch({
        type: "SET_SORTED",
        payload: [...filtered].sort((a, b) => a.price - b.price),
      });
    } else if (sortingOption === "Price Descending") {
      dispatch({
        type: "SET_SORTED",
        payload: [...filtered].sort((a, b) => b.price - a.price),
      });
    } else if (sortingOption === "Title Ascending") {
      dispatch({
        type: "SET_SORTED",
        payload: [...filtered].sort((a, b) => a.title.localeCompare(b.title)),
      });
    } else if (sortingOption === "Title Descending") {
      dispatch({
        type: "SET_SORTED",
        payload: [...filtered].sort((a, b) => b.title.localeCompare(a.title)),
      });
    } else {
      dispatch({ type: "SET_SORTED", payload: filtered });
    }
    dispatch({ type: "SET_CURRENT_PAGE", payload: 1 });
  }, [filtered, sortingOption]);

  useEffect(() => {
    if (productDetails.length > 0) {
      // Use fetched product details when available
      setLoadedItems(productDetails.slice(0, 8));
    } else {
      // Use sorted data from the filter reducer as fallback
      setLoadedItems(sorted.slice(0, 8));
    }
  }, [sorted, productDetails]);

  const handleLoad = () => {
    setLoading(true);
    setTimeout(() => {
      if (productDetails.length > 0) {
        // Load more products from productDetails
        setLoadedItems((pre) => [
          ...pre,
          ...productDetails.slice(pre.length, pre.length + 4),
        ]);
      } else {
        // Load more products from the sorted data as fallback
        setLoadedItems((pre) => [
          ...pre,
          ...sorted.slice(pre.length, pre.length + 4),
        ]);
      }
      setLoading(false);
    }, 1000);
  };
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
              productLength={productDetails.length > 0 ? productDetails.length : sorted.length} 
              allProps={allProps} 
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

      <FilterModal allProps={allProps} />
    </>
  );
}
