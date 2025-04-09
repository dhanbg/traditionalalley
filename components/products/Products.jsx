"use client";

import LayoutHandler from "./LayoutHandler";
import Sorting from "./Sorting";
import Listview from "./Listview";
import GridView from "./GridView";
import { useEffect, useReducer, useState } from "react";
import FilterModal from "./FilterModal";
import { initialState, reducer } from "@/reducer/filterReducer";
import FilterMeta from "./FilterMeta";
import { fetchDataFromApi } from "@/utils/api";
import { 
  PRODUCTS_API, 
  PRODUCTS_BY_CATEGORY_API, 
  COLLECTION_BY_SLUG_API,
  COLLECTION_BY_DOCUMENT_ID_API,
  PRODUCT_BY_DOCUMENT_ID_API
} from "@/utils/urls";

export default function Products14({ parentClass = "flat-spacing", collection = 'bossLady' }) {
  const [activeLayout, setActiveLayout] = useState(4);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [loading, setLoading] = useState(false);
  const [loadedItems, setLoadedItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [collectionData, setCollectionData] = useState(null);

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

  // Fetch product details including image URLs
  const fetchProductDetails = async (product) => {
    try {
      if (!product.documentId) {
        return product;
      }
      
      const response = await fetchDataFromApi(PRODUCT_BY_DOCUMENT_ID_API(product.documentId));
      
      if (response && response.data) {
        // Extract image URLs from the response, preferring large format
        let imgSrcUrl = '/images/placeholder.jpg';
        let imgHoverUrl = '/images/placeholder.jpg';
        
        // Get main image (imgSrc)
        if (response.data.imgSrc) {
          if (response.data.imgSrc.formats && response.data.imgSrc.formats.large) {
            imgSrcUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:1337'}${response.data.imgSrc.formats.large.url}`;
          } else if (response.data.imgSrc.url) {
            imgSrcUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:1337'}${response.data.imgSrc.url}`;
          }
        }
        
        // Get hover image (imgHover)
        if (response.data.imgHover) {
          if (response.data.imgHover.formats && response.data.imgHover.formats.large) {
            imgHoverUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:1337'}${response.data.imgHover.formats.large.url}`;
          } else if (response.data.imgHover.formats && response.data.imgHover.formats.small) {
            imgHoverUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:1337'}${response.data.imgHover.formats.small.url}`;
          } else if (response.data.imgHover.url) {
            imgHoverUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:1337'}${response.data.imgHover.url}`;
          }
        }
        
        return {
          ...product,
          imgSrc: imgSrcUrl,
          imgHover: imgHoverUrl,
          // Update any other fields from the detailed response if needed
          inStock: response.data.inStock !== undefined ? response.data.inStock : product.inStock,
          isOnSale: response.data.isOnSale !== undefined ? response.data.isOnSale : product.isOnSale,
          oldPrice: response.data.oldPrice || product.oldPrice,
          filterBrands: response.data.filterBrands || product.filterBrands,
          filterColor: response.data.filterColor || product.filterColor,
          filterSizes: response.data.filterSizes || product.filterSizes
        };
      }
      
      return product;
    } catch (error) {
      return product;
    }
  };

  // Transform products and fetch detailed info including images
  const transformAndFetchProductDetails = async (productsData) => {
    if (!Array.isArray(productsData)) {
      return [];
    }

    // First transform the basic product data
    const basicTransformedProducts = productsData.map(item => {
      try {
        if (!item) return null;
        
        return {
          id: item.id || 0,
          documentId: item.documentId || "",
          title: item.title || "Unknown Product",
          price: typeof item.price === 'number' ? item.price : 0,
          oldPrice: item.oldPrice || null,
          imgSrc: '/images/placeholder.jpg', // Placeholder until we fetch detailed info
          imgHover: '/images/placeholder.jpg', // Placeholder until we fetch detailed info
          isOnSale: Boolean(item.isOnSale),
          salePercentage: item.salePercentage || null,
          hotSale: Boolean(item.hotSale),
          inStock: Boolean(item.inStock),
          countdown: item.countdown || null,
          filterBrands: Array.isArray(item.filterBrands) ? item.filterBrands : [],
          filterColor: Array.isArray(item.filterColor) ? item.filterColor : [],
          filterSizes: Array.isArray(item.filterSizes) ? item.filterSizes : [],
          tabFilterOptions: Array.isArray(item.tabFilterOptions) ? item.tabFilterOptions : [],
          tabFilterOptions2: Array.isArray(item.tabFilterOptions2) ? item.tabFilterOptions2 : [],
          colors: Array.isArray(item.colors) ? item.colors : [],
          sizes: Array.isArray(item.sizes) ? item.sizes : [],
          addToCart: item.addToCart || {},
          slug: item.slug || '',
        };
      } catch (err) {
        return null;
      }
    }).filter(Boolean); // Remove any null items
    
    // Fetch detailed product info for each product
    const detailedProducts = await Promise.all(
      basicTransformedProducts.map(product => fetchProductDetails(product))
    );
    
    return detailedProducts;
  };

  // Fetch collection by slug, then fetch products by collection ID
  useEffect(() => {
    const fetchCollectionAndProducts = async () => {
      try {
        setLoading(true);
        let productsData = [];
        
        if (collection && collection !== 'all') {
          const collectionResponse = await fetchDataFromApi(COLLECTION_BY_SLUG_API(collection));
          
          if (collectionResponse && collectionResponse.data && Array.isArray(collectionResponse.data) && collectionResponse.data.length > 0) {
            const collectionData = collectionResponse.data[0];
            
            if (collectionData && typeof collectionData === 'object') {
              if (collectionData.attributes) {
                // Get documentId from attributes or directly from the object
                let documentId = null;
                if (collectionData.attributes.documentId) {
                  documentId = collectionData.attributes.documentId;
                } else if (collectionData.documentId) {
                  documentId = collectionData.documentId;
                } else {
                  // If no documentId, try to use the id
                  documentId = collectionData.id;
                }
                
                if (documentId) {
                  setCollectionData(collectionData);
                  
                  // Then fetch products using the collection documentId
                  const productsResponse = await fetchDataFromApi(COLLECTION_BY_DOCUMENT_ID_API(documentId));
                  
                  // Check if we have products in the response, looking at different possible locations
                  if (productsResponse && productsResponse.data) {
                    if (productsResponse.data.attributes && productsResponse.data.attributes.products) {
                      productsData = productsResponse.data.attributes.products;
                    } else if (Array.isArray(productsResponse.data)) {
                      productsData = productsResponse.data;
                    } else if (productsResponse.data.products) {
                      productsData = productsResponse.data.products;
                    }
                  }
                } else {
                  // Fallback to category-based product fetching
                  const categoryResponse = await fetchDataFromApi(PRODUCTS_BY_CATEGORY_API(collection));
                  if (categoryResponse && categoryResponse.data) {
                    productsData = categoryResponse.data;
                  }
                }
              } else if (collectionData.documentId) {
                const productsResponse = await fetchDataFromApi(COLLECTION_BY_DOCUMENT_ID_API(collectionData.documentId));
                
                // Similar product extraction logic...
                if (productsResponse && productsResponse.data) {
                  if (productsResponse.data.attributes && productsResponse.data.attributes.products) {
                    productsData = productsResponse.data.attributes.products;
                  } else if (Array.isArray(productsResponse.data)) {
                    productsData = productsResponse.data;
                  } else if (productsResponse.data.products) {
                    productsData = productsResponse.data.products;
                  }
                }
              } else {
                // Fallback to category-based approach
                const categoryResponse = await fetchDataFromApi(PRODUCTS_BY_CATEGORY_API(collection));
                if (categoryResponse && categoryResponse.data) {
                  productsData = categoryResponse.data;
                }
              }
            } else {
              // Fallback to category-based approach
              const categoryResponse = await fetchDataFromApi(PRODUCTS_BY_CATEGORY_API(collection));
              if (categoryResponse && categoryResponse.data) {
                productsData = categoryResponse.data;
              }
            }
          } else {
            // Fallback to category-based product fetching
            const categoryResponse = await fetchDataFromApi(PRODUCTS_BY_CATEGORY_API(collection));
            if (categoryResponse && categoryResponse.data) {
              productsData = categoryResponse.data;
            }
          }
        } else {
          // If no collection specified, fetch all products
          const allProductsResponse = await fetchDataFromApi(PRODUCTS_API);
          if (allProductsResponse && allProductsResponse.data) {
            productsData = allProductsResponse.data;
          }
        }
        
        // Use the transform and fetch function
        const transformedProducts = await transformAndFetchProductDetails(productsData);
        
        setProducts(transformedProducts);
        dispatch({ type: "SET_FILTERED", payload: transformedProducts });
        dispatch({ type: "SET_SORTED", payload: transformedProducts });
      } catch (error) {
        setProducts([]);
        dispatch({ type: "SET_FILTERED", payload: [] });
        dispatch({ type: "SET_SORTED", payload: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionAndProducts();
  }, [collection]);

  useEffect(() => {
    if (!products.length) return;
    
    let filteredArrays = [];

    if (brands.length) {
      const filteredByBrands = [...products].filter((elm) =>
        brands.every((el) => elm.filterBrands.includes(el))
      );
      filteredArrays = [...filteredArrays, filteredByBrands];
    }
    if (availability !== "All") {
      const filteredByavailability = [...products].filter(
        (elm) => availability.value === elm.inStock
      );
      filteredArrays = [...filteredArrays, filteredByavailability];
    }
    if (color !== "All") {
      const filteredByColor = [...products].filter((elm) =>
        elm.filterColor.includes(color.name)
      );
      filteredArrays = [...filteredArrays, filteredByColor];
    }
    if (size !== "All" && size !== "Free Size") {
      const filteredBysize = [...products].filter((elm) =>
        elm.filterSizes.includes(size)
      );
      filteredArrays = [...filteredArrays, filteredBysize];
    }
    if (activeFilterOnSale) {
      const filteredByonSale = [...products].filter((elm) => elm.oldPrice);
      filteredArrays = [...filteredArrays, filteredByonSale];
    }

    const filteredByPrice = [...products].filter(
      (elm) => elm.price >= price[0] && elm.price <= price[1]
    );
    filteredArrays = [...filteredArrays, filteredByPrice];

    const commonItems = [...products].filter((item) =>
      filteredArrays.every((array) => array.includes(item))
    );
    dispatch({ type: "SET_FILTERED", payload: commonItems });
  }, [price, availability, color, size, brands, activeFilterOnSale, products]);

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
    setLoadedItems(sorted.slice(0, 8));
  }, [sorted]);

  const handleLoad = () => {
    setLoading(true);
    setTimeout(() => {
      setLoadedItems((pre) => [
        ...pre,
        ...sorted.slice(pre.length, pre.length + 4),
      ]);
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
            <FilterMeta productLength={sorted.length} allProps={allProps} />

            {loading && products.length === 0 ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading products...</p>
              </div>
            ) : activeLayout == 1 ? (
              <div className="tf-list-layout wrapper-shop" id="listLayout">
                <Listview pagination={false} products={loadedItems} />
                {sorted.length == loadedItems.length ? (
                  ""
                ) : (
                  <button
                    className={`load-more-btn btn-out-line tf-loading ${
                      loading ? "loading" : ""
                    } `}
                    onClick={() => handleLoad()}
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
                {sorted.length == loadedItems.length ? (
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

      <FilterModal allProps={allProps} products={products} />
    </>
  );
}
